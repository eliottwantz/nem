INSERT INTO
    auth.users (
        id,
        email,
        email_verified,
        first_name,
        last_name,
        role,
        prefered_language,
        avatar_file_path,
        avatar_url,
        created_at,
        updated_at
    )
VALUES (
        '65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b',
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
        first_name,
        last_name,
        role,
        prefered_language
    )
values (
        '65ab38ef-d3a2-466f-9ee3-a3e0f5f0685b':: uuid,
        'admin',
        'admin',
        'admin',
        'en'
    ), (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240':: uuid,
        'teacher',
        'teacher',
        'teacher',
        'en'
    ), (
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde':: uuid,
        'a',
        'a',
        'student',
        'en'
    ), (
        '54fa2b35-fd53-4aaa-8264-26bd738c90cc':: uuid,
        'b',
        'b',
        'student',
        'en'
    );

insert into
    "public".learn (language, topic)
values ('English', 'Language'), ('French', 'Language'), ('Arabic', 'Language');

insert into
    "public".user_learn (user_id, learn_id)
values (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240':: uuid,
        1
    ), (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240':: uuid,
        2
    ), (
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde':: uuid,
        1
    );

insert into
    "public".class (
        id,
        name,
        learn_id,
        start_at,
        end_at
    )
values (
        '7823d99c-40e7-435b-9049-134ff0a61a9b':: uuid,
        'Class 1',
        1,
        '2024-08-23 19:00:00.000+00',
        '2024-08-23 20:00:00.000+00'
    );

insert into
    "public".user_class (user_id, class_id)
values (
        '3fe7bbf2-713d-4baa-b2da-2bb7df701240':: uuid,
        '7823d99c-40e7-435b-9049-134ff0a61a9b':: uuid
    ), (
        'd8264d2b-99ba-4e4c-a86f-f7eaad15ccde':: uuid,
        '7823d99c-40e7-435b-9049-134ff0a61a9b':: uuid
    );