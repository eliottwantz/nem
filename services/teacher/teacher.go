package teacher

import (
	"context"
	"database/sql"
	"errors"
	"slices"
	"time"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/api/ws"
	"nem/db"
	"nem/utils"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
	"github.com/jackc/pgerrcode"
	"github.com/lib/pq"
)

type Service struct {
	wsService *ws.Service
	logger    *log.Logger
}

func NewService(wsService *ws.Service) *Service {
	return &Service{
		wsService: wsService,
		logger:    log.WithPrefix("TeacherService"),
	}
}

func (s *Service) FindTeacherByID(ctx context.Context, id string) (*rpc.Teacher, error) {
	uID, err := uuid.Parse(id)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty user id param"))
	}
	u, err := db.Pg.FindTeacherByID(ctx, uID)
	if err != nil {
		s.logger.Warn("could not find teacher", "err", err)
		if err == sql.ErrNoRows {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("teacher not found"))
		}
		return nil, rpc.ErrWebrpcInternalError
	}

	return rpc.FromDbTeacher(u), nil
}

func (s *Service) ListClasses(ctx context.Context, teacherId string) ([]*rpc.Class, error) {
	tID, err := uuid.Parse(teacherId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty teacher id param"))
	}
	res, err := db.Pg.ListClassesOfTeacher(ctx, tID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Class, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Class{
			Id:         c.ID.String(),
			Name:       c.Name,
			IsPrivate:  c.IsPrivate,
			HasStarted: c.HasStarted,
			Language:   c.Language,
			Topic:      c.Topic,
			StartAt:    c.StartAt,
			EndAt:      c.EndAt,
			CreatedAt:  c.CreatedAt,
			TeacherId:  tID.String(),
		})
	}
	return ret, nil
}

func (s *Service) ListStudents(ctx context.Context, teacherId string) ([]*rpc.User, error) {
	tID, err := uuid.Parse(teacherId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty teacher id param"))
	}
	res, err := db.Pg.ListStudentsOfTeacher(ctx, tID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.User, 0, len(res))
	for _, c := range res {
		ret = append(ret, rpc.FromDbUser(c))
	}

	return ret, nil
}

func (s *Service) ListAvailabilities(ctx context.Context, teacherId string) ([]*rpc.TimeSlot, error) {
	tID, err := uuid.Parse(teacherId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("teacherId is empty"))
	}

	timeSlots, err := db.Pg.ListTeachersAvailableTimeSlots(ctx, tID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	userClasses, err := db.Pg.ListClassesOfStudent(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	userClassesTimeSlots := make([]string, 0, len(userClasses))
	for _, c := range userClasses {
		userClassesTimeSlots = append(userClassesTimeSlots, c.TimeSlotID.String())
	}

	now := time.Now()
	ret := make([]*rpc.TimeSlot, 0, len(timeSlots))
	for _, t := range timeSlots {
		if slices.Contains(userClassesTimeSlots, t.ID.String()) {
			continue
		}
		if t.NumUsers >= 4 {
			continue
		}
		if t.IsPrivate.Valid && t.IsPrivate.Bool {
			continue
		}
		if t.StartAt.Before(now) || t.EndAt.Before(now) {
			continue
		}
		ret = append(ret, &rpc.TimeSlot{
			Id:        t.ID.String(),
			TeacherId: t.TeacherID.String(),
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
	}

	return ret, nil
}

func (s *Service) Teach(ctx context.Context, topic string) error {
	if topic == "" {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty topic param"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	dbTopic, err := tx.FindTopic(ctx, topic)
	if err != nil {
		if err == sql.ErrNoRows {
			return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("topic not found"))
		}
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("this topic does not exist"))
	}

	// Add user to learn
	err = tx.AddTeacherToTopics(ctx, db.AddTeacherToTopicsParams{
		TeacherID: httpmw.ContextUID(ctx),
		TopicID:   dbTopic.ID,
	})
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("could not complete request"))
	}

	err = tx.Commit()
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return nil
}

func (s *Service) StopTeachingTopics(ctx context.Context, topics []string) error {
	if len(topics) == 0 {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty topics param"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		s.logger.Warn("could not start transaction", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}
	defer tx.Rollback()

	for _, topic := range topics {
		dbTopic, err := tx.FindTopic(ctx, topic)
		if err != nil {
			s.logger.Warn("could not find topic", "err", err)
			if err == sql.ErrNoRows {
				return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("topic not found"))
			}
			return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("this topic does not exist"))
		}

		err = tx.RemoveTeacherFromTopics(ctx, db.RemoveTeacherFromTopicsParams{
			TeacherID: httpmw.ContextUID(ctx),
			TopicID:   dbTopic.ID,
		})
		if err != nil {
			s.logger.Warn("could not remove teacher from topic", "err", err)
			return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("could not complete request"))
		}
	}

	err = tx.Commit()
	if err != nil {
		s.logger.Warn("could not commit transaction", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}

	return nil
}

func (s *Service) AddAvailability(ctx context.Context, req *rpc.AddAvailabilityRequest) ([]*rpc.TimeSlot, error) {
	err := req.Validate()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, err)
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	teacherID := httpmw.ContextUID(ctx)
	timeSlots := make([]*db.TimeSlot, 0, len(req.Times))

	for _, t := range req.Times {
		res, err := tx.AddTimeSlot(ctx, db.AddTimeSlotParams{
			TeacherID: teacherID,
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
		if err != nil {
			log.Warn("could not add availability", "err", err)
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}
		timeSlots = append(timeSlots, res)
	}

	err = tx.Commit()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.TimeSlot, 0, len(timeSlots))
	for _, t := range timeSlots {
		ret = append(ret, &rpc.TimeSlot{
			Id:        t.ID.String(),
			TeacherId: t.TeacherID.String(),
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
	}

	return ret, nil
}

func (s *Service) UpdateAvailability(ctx context.Context, req *rpc.EditAvailabilityRequest) ([]*rpc.TimeSlot, error) {
	err := req.Validate()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, err)
	}

	if req.Id == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeslot id param"))
	}
	tID, err := uuid.Parse(req.Id)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeslot id param"))
	}
	teacherID := httpmw.ContextUID(ctx)

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	_, err = tx.FindClassByTimeslot(ctx, tID)
	if err == nil {
		// There is a class for that time slot. Cannot update it
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("cannot update this time slot because there is already an existing class on this time slot"))
	}

	if len(req.Times) > 1 {
		// The user updated a time slot to span on multiple one hour time slots
		// First delete the old time slot then add the new ones
		err = tx.DeleteTimeSlot(ctx, db.DeleteTimeSlotParams{
			ID:        tID,
			TeacherID: teacherID,
		})
		if err != nil {
			log.Warn("could not delete availability", "err", err)
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}

		timeSlots := make([]*db.TimeSlot, 0, len(req.Times))

		for _, t := range req.Times {
			res, err := tx.AddTimeSlot(ctx, db.AddTimeSlotParams{
				TeacherID: teacherID,
				StartAt:   t.StartAt,
				EndAt:     t.EndAt,
			})
			if err != nil {
				log.Warn("could not add availability", "err", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
			}
			timeSlots = append(timeSlots, res)
		}

		ret := make([]*rpc.TimeSlot, 0, len(req.Times))
		for _, t := range timeSlots {
			ret = append(ret, &rpc.TimeSlot{
				Id:        t.ID.String(),
				TeacherId: t.TeacherID.String(),
				StartAt:   t.StartAt,
				EndAt:     t.EndAt,
			})
		}

		err = tx.Commit()
		if err != nil {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}

		return ret, nil
	} else {

		res, err := db.Pg.UpdateTimeSlot(ctx, db.UpdateTimeSlotParams{
			StartAt:   req.StartAt,
			EndAt:     req.EndAt,
			ID:        tID,
			TeacherID: teacherID,
		})
		if err != nil {
			log.Warn("could not update availability", "err", err)
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}

		err = tx.Commit()
		if err != nil {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}

		return []*rpc.TimeSlot{{
			Id:        res.ID.String(),
			TeacherId: res.TeacherID.String(),
			StartAt:   res.StartAt,
			EndAt:     res.EndAt,
		}}, nil
	}
}

func (s *Service) DeleteAvailability(ctx context.Context, id string) error {
	tID, err := uuid.Parse(id)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeslot id param"))
	}
	err = db.Pg.DeleteTimeSlot(ctx, db.DeleteTimeSlotParams{
		ID:        tID,
		TeacherID: httpmw.ContextUID(ctx),
	})
	if err != nil {
		var pgErr *pq.Error
		if errors.As(err, &pgErr) {
			if pgErr.Code == pgerrcode.ForeignKeyViolation {
				log.Warn("Trying to delete a time slot that already has a class on it")
				return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("cannot delete this time slot because there is already an existing class on this time slot"))
			}
		}
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return nil
}

func (s *Service) StartClass(ctx context.Context, classId string) error {
	s.logger.Info("start class", "classId", classId)

	cID, err := uuid.Parse(classId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}

	class, err := db.Pg.FindClass(ctx, cID)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
	}

	err = db.Pg.SetClassHasStarted(ctx, class.ID)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return s.wsService.StartClass(class.ConversationID, httpmw.ContextUID(ctx))
}

func (s *Service) EndClass(ctx context.Context, classId string) error {
	s.logger.Info("end class", "classId", classId)

	cID, err := uuid.Parse(classId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}

	class, err := db.Pg.FindClass(ctx, cID)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
	}

	return s.wsService.EndClass(class.ConversationID)
}

func (s *Service) CancelClass(ctx context.Context, classId string) ([]*rpc.User, *rpc.User, error) {
	cID, err := uuid.Parse(classId)
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty class id"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	_, err = tx.FindClass(ctx, cID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
		}
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	usersInClass, err := tx.ListStudentsInClass(ctx, cID)
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	// Remove all students from class
	for _, u := range usersInClass {
		err = tx.RemoveStudentFromClass(ctx, db.RemoveStudentFromClassParams{
			StudentID: u.ID,
			ClassID:   cID,
		})
		if err != nil {
			return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}
	}

	teacher, err := tx.FindUserByID(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	// Delete class
	err = tx.DeleteClass(ctx, cID)
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.User, 0, len(usersInClass))
	for _, u := range usersInClass {
		ret = append(ret, rpc.FromDbUser(u))
	}

	return ret, rpc.FromDbUser(teacher), nil
}
