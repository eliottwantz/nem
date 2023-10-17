INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
    )
VALUES (
        '00000000-0000-0000-0000-000000000000',
        '65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b',
        'authenticated',
        'authenticated',
        'admin@nem.com',
        '$2a$10$zmDR3TUYnaC4OvbTrufahOkYILCeD55SH40PJ4vv86NNz0QdkjgcG',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240',
        'authenticated',
        'authenticated',
        'teacher@nem.com',
        '$2a$10$zmDR3TUYnaC4OvbTrufahOkYILCeD55SH40PJ4vv86NNz0QdkjgcG',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '9974eb35-ff48-43eb-a047-9af99abfd3d0',
        'authenticated',
        'authenticated',
        'teacher2@nem.com',
        '$2a$10$zmDR3TUYnaC4OvbTrufahOkYILCeD55SH40PJ4vv86NNz0QdkjgcG',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde',
        'authenticated',
        'authenticated',
        'a@nem.com',
        '$2a$10$zmDR3TUYnaC4OvbTrufahOkYILCeD55SH40PJ4vv86NNz0QdkjgcG',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc',
        'authenticated',
        'authenticated',
        'b@nem.com',
        '$2a$10$zmDR3TUYnaC4OvbTrufahOkYILCeD55SH40PJ4vv86NNz0QdkjgcG',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00',
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL
    );
INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    )
VALUES (
        '65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b',
        '65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b'::uuid,
        '{"sub": "65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b","email":"admin@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    ),
    (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240',
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240'::uuid,
        '{"sub": "3fe7bbf2-713d-4baa-b2da-2bb7df701240","email":"teacher@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    ),
    (
        '9974eb35-ff48-43eb-a047-9af99abfd3d0',
        '9974eb35-ff48-43eb-a047-9af99abfd3d0'::uuid,
        '{"sub": "9974eb35-ff48-43eb-a047-9af99abfd3d0","email":"teacher2@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    ),
    (
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde',
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde'::uuid,
        '{"sub": "d8264d2b-99ba-4e4c-a86f-f7eaad15ccde","email":"a@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    ),
    (
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc',
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc'::uuid,
        '{"sub": "54fa2b35-fd53-4aaa-8264-26bd738c90cc","email":"b@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    );
insert into "public"."user" (
        id,
        email,
        first_name,
        last_name,
        role,
        prefered_language
    )
values (
        '65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b'::uuid,
        'admin@nem.com',
        'admin',
        'admin',
        'admin',
        'en'
    ),
    (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240'::uuid,
        'teacher@nem.com',
        'Eliott',
        'Teaches',
        'teacher',
        'en'
    ),
    (
        '9974eb35-ff48-43eb-a047-9af99abfd3d0'::uuid,
        'teacher2@nem.com',
        'Mark',
        'Roberts',
        'teacher',
        'en'
    ),
    (
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde'::uuid,
        'a@nem.com',
        'a',
        'a',
        'student',
        'en'
    ),
    (
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc'::uuid,
        'b@nem.com',
        'b',
        'b',
        'student',
        'en'
    );
INSERT INTO "student" (id)
VALUES (
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde'::uuid
    ),
    (
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc'::uuid
    );
INSERT INTO "teacher" (id, bio, hour_rate)
VALUES (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240'::uuid,
        'Bienvenue à mes cours de langue en ligne ! Je suis passionné(e) par l''enseignement des langues et je suis ravi(e) de vous aider à atteindre vos objectifs linguistiques. Avec une expérience de plusieurs années dans l''enseignement des langues, je suis là pour rendre votre voyage d''apprentissage agréable et efficace.

Mes cours sont conçus pour être interactifs, engageants et adaptés à vos besoins spécifiques. Que vous souhaitiez améliorer votre conversation, renforcer vos compétences en grammaire ou préparer un examen, nous travaillerons ensemble pour atteindre vos objectifs.

En tant qu''instructeur, je m''engage à créer un environnement d''apprentissage positif et inclusif où vous vous sentirez à l''aise pour pratiquer et progresser. Rejoignez-moi dans cette aventure linguistique et découvrez la beauté et la richesse d''une nouvelle langue. Ensemble, nous allons explorer de nouveaux horizons linguistiques !',
        30
    ),
    (
        '9974eb35-ff48-43eb-a047-9af99abfd3d0'::uuid,
        'I am an english teacher',
        27
    );
INSERT INTO "language" (language)
VALUES ('French'),
    ('English');
INSERT INTO "spoken_language" (language_id, proficiency)
VALUES (1, 'A1'),
    (1, 'A2'),
    (1, 'B1'),
    (1, 'B2'),
    (1, 'C1'),
    (1, 'C2'),
    (1, 'Native'),
    (2, 'A1'),
    (2, 'A2'),
    (2, 'B1'),
    (2, 'B2'),
    (2, 'C1'),
    (2, 'C2'),
    (2, 'Native');
INSERT INTO "teacher_spoken_language" (
        spoken_language_id,
        teacher_id
    )
VALUES (
        7,
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240'::uuid
    ),
    (
        13,
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240'::uuid
    ),
    (
        14,
        '9974eb35-ff48-43eb-a047-9af99abfd3d0'::uuid
    );
INSERT INTO topics (topic)
VALUES ('French'),
    ('English'),
    ('Mathematics'),
    ('Philosophy'),
    ('Biology'),
    ('Physics'),
    ('Chemistry'),
    ('History'),
    ('Geography');
INSERT INTO "teacher_topic" (teacher_id, topic_id)
VALUES (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240'::uuid,
        1
    ),
    (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240'::uuid,
        3
    ),
    (
        '9974eb35-ff48-43eb-a047-9af99abfd3d0'::uuid,
        6
    ),
    (
        '9974eb35-ff48-43eb-a047-9af99abfd3d0'::uuid,
        7
    );
INSERT INTO "subscription" (id, name, hours)
VALUES (1, 'Explorer', 1),
    (2, 'Voyage', 2),
    (3, 'Enlighten', 3),
    (4, 'Master', 4);