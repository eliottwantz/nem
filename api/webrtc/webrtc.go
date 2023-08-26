package webrtc

// import (
// 	"context"
// 	"encoding/json"
// 	"fmt"
// 	"net/http"

// 	"github.com/charmbracelet/log"
// 	gorillaWs "github.com/gorilla/websocket"
// 	"github.com/pion/ion-sfu/pkg/sfu"
// 	"github.com/pion/webrtc/v3"
// 	"github.com/sourcegraph/jsonrpc2"
// 	"github.com/sourcegraph/jsonrpc2/websocket"
// )

// type Manager struct {
// 	*sfu.SFU
// }

// func NewManager() *Manager {
// 	cfg := sfu.Config{
// 		Router: sfu.RouterConfig{
// 			MaxBandwidth:        1500,
// 			MaxPacketTrack:      500,
// 			AudioLevelThreshold: 40,
// 			AudioLevelInterval:  1000,
// 			AudioLevelFilter:    20,
// 			Simulcast: sfu.SimulcastConfig{
// 				BestQualityFirst: true,
// 			},
// 		},
// 		WebRTC: sfu.WebRTCConfig{
// 			ICEPortRange: []uint16{5000, 5200},
// 			SDPSemantics: "unified-plan",
// 			MDNS:         true,
// 			Timeouts: sfu.WebRTCTimeoutsConfig{
// 				ICEDisconnectedTimeout: 5,
// 				ICEFailedTimeout:       25,
// 				ICEKeepaliveInterval:   2,
// 			},
// 		},
// 		Turn: sfu.TurnConfig{
// 			Realm:   "ion",
// 			Address: "0.0.0.0:3478",
// 			Auth: sfu.TurnAuth{
// 				Credentials: "pion=ion,pion2=ion2",
// 			},
// 		},
// 	}

// 	fmt.Println()
// 	fmt.Println()
// 	fmt.Printf("%+v\n", cfg)
// 	fmt.Println()
// 	fmt.Println()

// 	return &Manager{
// 		SFU: sfu.NewSFU(cfg),
// 	}
// }

// var upgrader = gorillaWs.Upgrader{
// 	CheckOrigin: func(r *http.Request) bool {
// 		return true
// 	},
// 	ReadBufferSize:  1024,
// 	WriteBufferSize: 1024,
// }

// func (m *Manager) ServeWebRTC(w http.ResponseWriter, r *http.Request) {
// 	conn, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Error("upgrade error", "err", err)
// 		return
// 	}
// 	defer conn.Close()

// 	p := NewJSONSignal(sfu.NewPeer(m))
// 	defer p.Close()

// 	jc := jsonrpc2.NewConn(r.Context(), websocket.NewObjectStream(conn), p)
// 	<-jc.DisconnectNotify()
// }

// // Join message sent when initializing a peer connection
// type Join struct {
// 	SID    string                    `json:"sid"`
// 	UID    string                    `json:"uid"`
// 	Offer  webrtc.SessionDescription `json:"offer"`
// 	Config sfu.JoinConfig            `json:"config"`
// }

// // Negotiation message sent when renegotiating the peer connection
// type Negotiation struct {
// 	Desc webrtc.SessionDescription `json:"desc"`
// }

// // Trickle message sent when renegotiating the peer connection
// type Trickle struct {
// 	Target    int                     `json:"target"`
// 	Candidate webrtc.ICECandidateInit `json:"candidate"`
// }

// type JSONSignal struct {
// 	*sfu.PeerLocal
// }

// func NewJSONSignal(p *sfu.PeerLocal) *JSONSignal {
// 	return &JSONSignal{PeerLocal: p}
// }

// // Handle incoming RPC call events like join, answer, offer and trickle
// func (p *JSONSignal) Handle(ctx context.Context, conn *jsonrpc2.Conn, req *jsonrpc2.Request) {
// 	replyError := func(err error) {
// 		_ = conn.ReplyWithError(ctx, req.ID, &jsonrpc2.Error{
// 			Code:    500,
// 			Message: err.Error(),
// 		})
// 	}

// 	switch req.Method {
// 	case "join":
// 		var join Join
// 		err := json.Unmarshal(*req.Params, &join)
// 		if err != nil {
// 			log.Error("connect: error parsing offer", "err", err)
// 			replyError(err)
// 			break
// 		}

// 		p.OnOffer = func(offer *webrtc.SessionDescription) {
// 			if err := conn.Notify(ctx, "offer", offer); err != nil {
// 				log.Error("error sending offer", "err", err)
// 			}
// 		}
// 		p.OnIceCandidate = func(candidate *webrtc.ICECandidateInit, target int) {
// 			if err := conn.Notify(ctx, "trickle", Trickle{
// 				Candidate: *candidate,
// 				Target:    target,
// 			}); err != nil {
// 				log.Error("error sending ice candidate", "err", err)
// 			}
// 		}

// 		err = p.Join(join.SID, join.UID, join.Config)
// 		if err != nil {
// 			replyError(err)
// 			break
// 		}

// 		answer, err := p.Answer(join.Offer)
// 		if err != nil {
// 			replyError(err)
// 			break
// 		}

// 		_ = conn.Reply(ctx, req.ID, answer)

// 	case "offer":
// 		var negotiation Negotiation
// 		err := json.Unmarshal(*req.Params, &negotiation)
// 		if err != nil {
// 			log.Error("connect: error parsing offer", "err", err)
// 			replyError(err)
// 			break
// 		}

// 		answer, err := p.Answer(negotiation.Desc)
// 		if err != nil {
// 			replyError(err)
// 			break
// 		}
// 		_ = conn.Reply(ctx, req.ID, answer)

// 	case "answer":
// 		var negotiation Negotiation
// 		err := json.Unmarshal(*req.Params, &negotiation)
// 		if err != nil {
// 			log.Error("connect: error parsing answer", "err", err)
// 			replyError(err)
// 			break
// 		}

// 		err = p.SetRemoteDescription(negotiation.Desc)
// 		if err != nil {
// 			replyError(err)
// 		}

// 	case "trickle":
// 		var trickle Trickle
// 		err := json.Unmarshal(*req.Params, &trickle)
// 		if err != nil {
// 			log.Error("connect: error parsing candidate", "err", err)
// 			replyError(err)
// 			break
// 		}

// 		err = p.Trickle(trickle.Candidate, trickle.Target)
// 		if err != nil {
// 			replyError(err)
// 		}
// 	}
// }
