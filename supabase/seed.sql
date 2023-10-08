INSERT INTO
    auth.users (
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
    ), (
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
    ), (
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
    ), (
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
    ), (
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

INSERT INTO
    auth.identities (
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
        '65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b':: uuid,
        '{"sub": "65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b","email":"admin@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    ), (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240',
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240':: uuid,
        '{"sub": "3fe7bbf2-713d-4baa-b2da-2bb7df701240","email":"teacher@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    ), (
        '9974eb35-ff48-43eb-a047-9af99abfd3d0',
        '9974eb35-ff48-43eb-a047-9af99abfd3d0':: uuid,
        '{"sub": "9974eb35-ff48-43eb-a047-9af99abfd3d0","email":"teacher2@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    ), (
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde',
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde':: uuid,
        '{"sub": "d8264d2b-99ba-4e4c-a86f-f7eaad15ccde","email":"a@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    ), (
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc',
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc':: uuid,
        '{"sub": "54fa2b35-fd53-4aaa-8264-26bd738c90cc","email":"b@nem.com"}',
        'email',
        '2022-10-04 04:45:00.000+00',
        '2022-10-04 03:41:27.391146+00',
        '2022-10-04 03:41:27.39308+00'
    );

insert into
    "public"."user" (
        id,
        email,
        first_name,
        last_name,
        role,
        prefered_language
    )
values (
        '65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b':: uuid,
        'admin@nem.com',
        'admin',
        'admin',
        'admin',
        'en'
    ), (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240':: uuid,
        'teacher@nem.com',
        'teacher',
        'teacher',
        'teacher',
        'en'
    ), (
        '9974eb35-ff48-43eb-a047-9af99abfd3d0':: uuid,
        'teacher2@nem.com',
        'teacher',
        'teacher',
        'teacher',
        'en'
    ), (
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde':: uuid,
        'a@nem.com',
        'a',
        'a',
        'student',
        'en'
    ), (
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc':: uuid,
        'b@nem.com',
        'b',
        'b',
        'student',
        'en'
    );

INSERT INTO
    "teacher" (id, bio, hour_rate)
VALUES (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240':: uuid,
        'Je suis un professeur de français',
        30
    ), (
        '9974eb35-ff48-43eb-a047-9af99abfd3d0':: uuid,
        'I am an english teacher',
        27
    );

INSERT INTO
    "spoken_language" (language, proficiency)
VALUES ('French', 'A1'), ('French', 'A2'), ('French', 'B1'), ('French', 'B2'), ('French', 'C1'), ('French', 'C2'), ('French', 'Native'), ('English', 'A1'), ('English', 'A2'), ('English', 'B1'), ('English', 'B2'), ('English', 'C1'), ('English', 'C2'), ('English', 'Native');

INSERT INTO
    "teacher_spoken_language" (
        spoken_language_id,
        teacher_id
    )
VALUES (
        7,
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240':: uuid
    ), (
        14,
        '9974eb35-ff48-43eb-a047-9af99abfd3d0':: uuid
    );

insert into
    "public".topic_taught (language, topic)
values ('English', 'English'), ('English', 'French'), ('French', 'English'), ('English', 'Arabic'), ('French', 'Maths');

INSERT INTO
    "subscription" (id, name, hours)
VALUES (1, 'Explorer', 1), (2, 'Voyage', 2), (3, 'Enlighten', 3), (4, 'Master', 4);