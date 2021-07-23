create schema if not exists tarlad collate utf8mb4_0900_ai_ci;

create table if not exists chat
(
	id bigint auto_increment
		primary key,
	title varchar(64) null,
	user_id bigint null
);

create table if not exists message
(
	id bigint auto_increment
		primary key,
	chat_id bigint not null,
	user_id bigint not null,
	type varchar(16) not null,
	data text not null,
	time bigint not null,
	constraint message
		unique (chat_id, user_id, time)
);

create index message_user
	on message (user_id);

create table if not exists post
(
	id bigint auto_increment
		primary key,
	url varchar(256) not null
);

create table if not exists user
(
	id bigint auto_increment
		primary key,
	email varchar(64) not null,
	password varchar(256) not null,
	nickname varchar(32) not null,
	name varchar(32) not null,
	surname varchar(32) not null,
	image_url varchar(256) null,
	constraint nickname
		unique (nickname)
);

create table if not exists banned_user
(
	user_id bigint not null,
	banned_id bigint not null,
	primary key (user_id, banned_id),
	constraint banned_user_banned
		foreign key (banned_id) references user (id),
	constraint banned_user_user
		foreign key (user_id) references user (id)
);

create table if not exists chats_list
(
	user_id bigint not null,
	chat_id bigint not null,
	primary key (user_id, chat_id),
	constraint chat_list_chat
		foreign key (chat_id) references chat (id),
	constraint chat_list_user
		foreign key (user_id) references user (id)
);

create table if not exists comment
(
	id bigint auto_increment
		primary key,
	user_id bigint not null,
	data text not null,
	time bigint not null,
	post_id bigint null,
	comment_id bigint null,
	constraint comment_comment
		foreign key (comment_id) references comment (id),
	constraint comment_post
		foreign key (post_id) references post (id),
	constraint comment_user
		foreign key (user_id) references user (id)
);

create table if not exists comment_likes
(
	comment_id bigint not null,
	user_id bigint not null,
	primary key (comment_id, user_id),
	constraint comment_likes_comment
		foreign key (comment_id) references comment (id),
	constraint comment_likes_user
		foreign key (user_id) references user (id)
);

create table if not exists message_seen
(
	message_id bigint not null,
	user_id bigint not null,
	primary key (message_id, user_id),
	constraint seen_message
		foreign key (message_id) references message (id),
	constraint seen_user
		foreign key (user_id) references user (id)
);

create table if not exists online
(
	user_id bigint not null
		primary key,
	time bigint not null,
	constraint online_user
		foreign key (user_id) references user (id)
);

create table if not exists post_likes
(
	post_id bigint not null,
	user_id bigint not null,
	primary key (post_id, user_id),
	constraint like_post
		foreign key (post_id) references post (id),
	constraint like_user
		foreign key (user_id) references user (id)
);

create table if not exists post_seen
(
	post_id bigint not null,
	user_id bigint not null,
	primary key (post_id, user_id),
	constraint post_seen_post
		foreign key (post_id) references post (id),
	constraint post_seen_user
		foreign key (user_id) references user (id)
);

create table if not exists posts_list
(
	user_id bigint not null,
	post_id bigint not null,
	primary key (user_id, post_id),
	constraint posts_list_post
		foreign key (post_id) references post (id),
	constraint posts_list_user
		foreign key (user_id) references user (id)
);

create table if not exists subscriber
(
	user_id bigint not null,
	subscriber_id bigint not null,
	primary key (user_id, subscriber_id),
	constraint subscriber_subscriber
		foreign key (subscriber_id) references user (id),
	constraint subscriber_user
		foreign key (user_id) references user (id)
);

create table if not exists token
(
	value varchar(64) not null
		primary key,
	user_id bigint not null,
	time bigint not null,
	constraint token_user
		foreign key (user_id) references user (id)
);

