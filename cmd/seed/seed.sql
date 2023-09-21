INSERT INTO
    "user" (
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
        'xeedlly9t1dkqhp',
        'admin@nem.com',
        TRUE,
        'admin',
        'admin',
        'admin',
        'fr',
        '',
        '',
        '2023-09-10 18:43:38.706+00',
        '2023-09-10 18:43:38.706+00'
    ), (
        'teedlly9t1dkqhp',
        'teacher@nem.com',
        TRUE,
        'teacher',
        'teacher',
        'teacher',
        'fr',
        '',
        '',
        '2023-09-10 18:43:38.706+00',
        '2023-09-10 18:43:38.706+00'
    ), (
        'aaedlly9t1dkqhp',
        'a@nem.com',
        TRUE,
        'a',
        'a',
        'student',
        'fr',
        '',
        '',
        '2023-09-10 18:43:38.706+00',
        '2023-09-10 18:43:38.706+00'
    );

INSERT INTO "user_key"
VALUES (
        'email:admin@nem.com',
        'xeedlly9t1dkqhp',
        's2:lq5vq03o1j4004nt:975e093e1a0177d5f6f800e881186aa34ebe9e98659a7e7d42b60eab79270fcf9c0caa39234e4ee6a49c0c530a3f7dd378e4841c5facbd37663ededd83c9453c'
    ), (
        'email:teacher@nem.com',
        'teedlly9t1dkqhp',
        's2:lq5vq03o1j4004nt:975e093e1a0177d5f6f800e881186aa34ebe9e98659a7e7d42b60eab79270fcf9c0caa39234e4ee6a49c0c530a3f7dd378e4841c5facbd37663ededd83c9453c'
    ), (
        'email:a@nem.com',
        'aaedlly9t1dkqhp',
        's2:lq5vq03o1j4004nt:975e093e1a0177d5f6f800e881186aa34ebe9e98659a7e7d42b60eab79270fcf9c0caa39234e4ee6a49c0c530a3f7dd378e4841c5facbd37663ededd83c9453c'
    );

insert into
    "learn" (language, topic)
values ('English', 'Language'), ('French', 'Language'), ('Arabic', 'Language');

insert into
    "user_learn" (user_id, learn_id)
values ('teedlly9t1dkqhp', 1), ('teedlly9t1dkqhp', 2), ('aaedlly9t1dkqhp', 1);

insert into "time_slots"
VALUES (
        '688aafd2-de8e-4593-884f-45a8472138e2':: uuid,
        '2023-09-23 16:00:00.000+00',
        '2023-09-23 17:00:00.000+00',
        'teedlly9t1dkqhp'
    ), (
        '839a7303-cb81-4bfa-8fa5-9e849c92a78b':: uuid,
        '2023-09-23 17:00:00.000+00',
        '2023-09-23 18:00:00.000+00',
        'teedlly9t1dkqhp'
    ), (
        '511969f2-eaa9-40e5-b65d-4c42e9b38fed':: uuid,
        '2023-09-23 18:00:00.000+00',
        '2023-09-23 19:00:00.000+00',
        'teedlly9t1dkqhp'
    ), (
        'f7b4b300-347f-415d-8f10-aa9d876a069b':: uuid,
        '2023-09-23 19:00:00.000+00',
        '2023-09-23 20:00:00.000+00',
        'teedlly9t1dkqhp'
    );

insert into
    "class" (
        id,
        name,
        learn_id,
        is_private,
        time_slot_id
    )
values (
        '7823d99c-40e7-435b-9049-134ff0a61a9b':: uuid,
        'Class 1',
        1,
        false,
        'f7b4b300-347f-415d-8f10-aa9d876a069b':: uuid
    );

insert into
    "user_class" (user_id, class_id)
values (
        'teedlly9t1dkqhp',
        '7823d99c-40e7-435b-9049-134ff0a61a9b':: uuid
    ), (
        'aaedlly9t1dkqhp',
        '7823d99c-40e7-435b-9049-134ff0a61a9b':: uuid
    );