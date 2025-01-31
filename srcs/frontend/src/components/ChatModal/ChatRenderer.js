import { languageSelector } from '../../components/LanguageSelector/languageSelector.js';

export class ChatRenderer {
    constructor(chatModal) {
        this.chatModal = chatModal;
		this.invitModalInstance = null;
    }

	renderChatElements(chats) {
        const container = document.getElementById('chat_element_container');

		if (container) {
			container.innerHTML = '';

			chats.forEach(chat => {
				const chatElement = this.createChatElement(chat);

				if (chatElement) {
					container.appendChild(chatElement);
				}
			});
		} else {
			console.warn("chat_element_container not found.")
		}
    }

	createChatElement(chat) {
		try {
			const chatHtml = `
				<div class="chat-element col-6 col-md-4 col-lg-2 d-flex flex-column align-items-center mb-4">
					<button
						class="user-profile-picture open_chat_btn btn rounded-circle bg-dark d-flex justify-content-center align-items-center position-relative"
						style="background-image: url(${chat.other_user_avatar_url || '/assets/images/default_avatar.jpg'});"
						data-bs-target="#messages_modal"
						data-bs-toggle="modal"
						data-chatroom_name="${chat.chatroom_name}"
					>
						<div
							class="status-dot position-absolute translate-middle border border-3 border-dark ${chat.other_user_online_status ? 'green' : 'gray'}-dot p-2"
							data-online-username="${chat.other_user_username}"
							style="top:90%; left:85%;"></div>
					</button>
					<p class="text-light mt-2">${chat.other_user_username}</p>
				</div>
			`;

			const template = document.createElement('template');
			template.innerHTML = chatHtml.trim();

			return template.content.firstChild;
		} catch (error) {
			console.error('Error creating chat element:', error);
			return null;
		}
	}

	renderChatMessages(messages, currentUser, isPublicChat) {
		if (messages) {
			const container = document.getElementById('chat_messages');

			if (container) {
				container.innerHTML = '';

				messages.forEach(message => {
					this.addMessageElement(message, currentUser, isPublicChat);
				});

				this.chatModal.chatRenderer.scrollToBottom(200);
			} else {
				console.warn('chat_messages not found.')
			}
		}
	}

	addMessageElement(message, currentUser, isPublicChat) {
		const messageHtml = message.author.username === currentUser ?
			this.createCurrentUserMessageContent(message.body) :
			this.createOtherUserMessageContent(message, isPublicChat);

		const template = document.createElement('template');
		template.innerHTML = messageHtml.trim();
		const messageElement = template.content.firstChild;

		const chatMessages = document.getElementById('chat_messages');

		if (chatMessages) {
			chatMessages.appendChild(messageElement);
		} else {
			console.warn('chat_messages not found.')
		}
	}

	createCurrentUserMessageContent(body) {
		return `
		<li class="fade-in-up d-flex mb-2 justify-content-end">
			<div class="my-message text-break rounded-top-3 p-3" style="max-width: 75%;">
				<span>${body}</span>
			</div>
			<div class="d-flex align-items-end">
				<svg height="13" width="8">
					<path fill="#bbf7d0" d="M6.3,10.4C1.5,8.7,0.9,5.5,0,0.2L0,13l5.2,0C7,13,9.6,11.5,6.3,10.4z"/>
				</svg>
			</div>
		</li>
		`;
	}

	createOtherUserMessageContent(message, isPublicChat) {
		if (isPublicChat) {
			const userBtn = `
			<a
				class="public-message user-profile-picture btn p-0 position-relative"
				href="/profile/${message.author.username}"
				style="
					background-image: url(${message.author.avatar || '/assets/images/default_avatar.jpg'});
					width: 35px;
					height: 35px;"
			>
				<div
					class="status-dot position-absolute translate-middle border border-3 border-dark ${message.author.is_online ? 'green' : 'gray'}-dot"
					data-online-username="${message.author.username}"
					style="top:90%; left:90%;"></div>
			</a>`;
			return `
			<li class="fade-in-up d-flex mb-2 flex-column justify-start">
				<div class="d-flex align-items-end">
					<div class="me-2">
						${userBtn}
					</div>
					<div class="d-flex align-items-end">
						<svg height="13" width="8">
							<path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z"></path>
						</svg>
					</div>
					<div class="other-message text-break bg-white rounded-top-3 p-3" style="max-width: 75%;">
						<span>${message.body}</span>
					</div>
				</div>
				<div class="text-muted small py-1 mt-2">
					<span class="text-white">${message.author.username}</span>
				</div>
			</li>
			`;
		} else {
			return `
			<li class="fade-in-up d-flex mb-2 flex-column justify-start">
				<div class="d-flex align-items-end">
					<svg height="13" width="8">
						<path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z"></path>
					</svg>
					<div class="other-message bg-white rounded-top-3 p-3" style="max-width: 75%;">
						<span>${message.body}</span>
					</div>
				</div>
			</li>
			`;
		}
	}

	renderChatHeader(isPublicChat, data) {
		const container = document.getElementById('chat_header_content');

		if (container) {
			container.innerHTML = '';

			const headerHtml = isPublicChat ?
				this.createPublicChatHeaderContent() :
				this.createPrivateChatHeaderContent(data);
			setTimeout(() => languageSelector.updateLanguage(), 0);

			const template = document.createElement('template');
			template.innerHTML = headerHtml.trim();
			const headerElement = template.content.firstChild;

			container.appendChild(headerElement);
		} else {
			console.warn('chat_header_content not found.');
		}
	}

	createPublicChatHeaderContent() {
		return `
		<div class="d-flex align-items-center">
			<span class="pr-1 position-absolute top-50 start-50" style="transform: translate(-50%, -50%); color: #34d399" data-i18n="public-chat"></span>
		</div>
		`;
	}

	createPrivateChatHeaderContent(data) {
		const blockStatus = data.block_status;
		const isBlocker = blockStatus === "blocker";
		const action = isBlocker ? 'unblock' : 'block';
		const buttonText = isBlocker ? '<span data-i18n="unblock"></span>' : '<span data-i18n="block"></span>';

		return `
		<div class="d-flex align-items-center">
			<div class="d-flex align-items-end me-2 dropup">
				<button
					type="button"
					class="private-header user-profile-picture btn p-0"
					data-bs-toggle="dropdown"
					style="
						background-image: url(${data.other_user.avatar || '/assets/images/default_avatar.jpg'});
						width: 42px;
						height: 42px;"
				>
					<div
						class="status-dot position-absolute translate-middle border border-3 border-dark ${data.other_user.is_online ? 'green' : 'gray'}-dot"
						data-online-username="${data.other_user.username}"
						style="top:90%; left:90%;"></div>
				</button>
				<ul class="dropdown-menu dropdown-menu-dark">
					<li><a href="/profile/${data.other_user.username}" class="dropdown-item" data-i18n="profile"></a></li>
					<li><hr class="dropdown-divider"></li>
					<li>
						<button
							id="invite_to_play_btn"
							class="dropdown-item"
							data-invite-to-play-id="${data.other_user.id}">
							<span data-i18n="invite-to-play"></span>
						</button>
					</li>
					<li>
						<button class="dropdown-item block-unblock-btn"
							data-block-action="${action}"
							data-block-user-id="${data.other_user.id}">
							${buttonText}
						</button>
                	</li>
				</ul>
			</div>
			<span class="text-light">${data.other_user.username}</span>
		</div>
		`;
	}

	renderMessageInputContainer(blockStatus, otherUserId) {
        const messageInputContainer = document.getElementById('message_input_container');
        if (messageInputContainer) {
            this.removeBlockStatusMessage();

            const blockMessage = this.createInputBlockMessage(blockStatus, otherUserId);

            if (blockMessage) {
                messageInputContainer.insertAdjacentHTML('afterbegin', blockMessage);
                this.toggleInputState(true);
            } else {
                this.toggleInputState(false);
            }
        }
    }

	createInputBlockMessage(blockStatus, otherUserId) {
		if (blockStatus === "blocker") {
			 return `
			 	<div class="text-light block-status-message mb-2">
					You have blocked this user.
					<a id="unblock_btn" class="unblock-btn" data-block-action="unblock" data-block-user-id="${otherUserId}">Unblock</a>.
				</div>
			`;
		} else if (blockStatus === "blocked") {
			return `
				<div class="text-light block-status-message mb-2">
					You are blocked by this user.
				</div>`;
		}
		else {
			return null;
		}
	}

	onConnect1x1InitRender(data) {
        try {
            const container = document.getElementById('match_waiting_modal_container');

			if (container) {
				this.renderModalLayout1x1(data.current_user);
				this.renderUsers1x1(data.players, data.current_user);
				this.renderButtons1x1();

				this.updateStatusClasses1x1(data.players)

				this.chatModal.uiSetup.setupButtons1x1(data.group_name);
			} else {
				console.warn('match_waiting_modal_container not found.');
			}

			const invite = document.getElementById('match_waiting_modal');
            if (invite) {
                const messages = document.getElementById('messages_modal');
                if (messages) {
                    const chatInstance = bootstrap.Modal.getInstance(messages);
                    if (chatInstance) {
                        chatInstance.hide();
                    }
                }

                const chats = document.getElementById('chats_modal');
                if (chats) {
                    const chatInstance = bootstrap.Modal.getInstance(chats);
                    if (chatInstance) {
                        chatInstance.hide();
                    }
                }
            } else {
                console.warn('match_waiting_modal not found.');
            }
        } catch (error) {
                console.error('Failed to invite to match:', error);
        }
    }

	renderModalLayout1x1(current_user) {
		const container = document.getElementById('match_waiting_modal_container');

		if (container) {
			container.innerHTML = `
				<div id="match_waiting_modal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true" data-current-user-1x1="${current_user}">
					<div class="modal-bg">
						<div class="modal-dialog modal-dialog-centered">
							<div class="modal-content">
								<div class="modal-header justify-content-center">
									<h1 class="modal-title fs-5">Waiting for players!</h1>
								</div>
								<div class="modal-body">
									<div id="player_section" class="container d-flex align-items-center text-center justify-content-center gap-4">
										<!-- Users will be rendered here -->
									</div>
								</div>
								<div class="modal-footer">
									<div class="timer" id="match_waiting_timer"></div>
									<div id="match_waiting_buttons_container" class="button-container d-flex align-items-center justify-content-center">
										<!-- Buttons will be rendered here -->
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;

			const inviteModalElement = document.getElementById('match_waiting_modal');
			if (!this.invitModalInstance) {
				this.invitModalInstance = new bootstrap.Modal(inviteModalElement);
			}
			this.invitModalInstance.show();
		} else {
			console.warn('match_waiting_modal_container not found.');
		}
	}

	hideInviteModal() {
		if (this.invitModalInstance) {
			this.invitModalInstance.hide()

			const container = document.getElementById('match_waiting_modal_container');
			const modal = container.querySelector('#match_waiting_modal');

			if (container && modal) {
				this.chatModal.addEventListener(modal, 'hidden.bs.modal', () => {
					this.invitModalInstance = null;
					container.innerHTML = '';
				})
			}
		}
	}

	renderUsers1x1(players, current_user) {
		const playerSection = document.getElementById('player_section');

		if (playerSection) {
			const player1 = players[0].username === current_user ? {
				username: "You",
				realUsername: players[0].username,
				avatar: players[0].avatar,
				status: players[0].status,
			} : {
				username: "You",
				realUsername: players[1].username,
				avatar: players[1].avatar,
				status: players[1].status,
			};


			const player2 = players[0].username !== current_user ? players[0] : players[1];

			playerSection.innerHTML = `
				<div class="player-container ${this.getStatusClass(player1.status)}" data-username-1x1="${player1.realUsername}">
					<div class="img" style="background-image: url(${player1.avatar || '/assets/images/default_avatar.jpg'});"></div>
					<span>${player1.username}</span>
				</div>
				<div class="vs">
					<i class="fa-solid fa-v"></i> / <i class="fa-solid fa-s"></i>
				</div>
				<div class="player-container ${this.getStatusClass(player2.status)}" data-username-1x1="${player2.username}">
					<div class="img" style="background-image: url(${player2.avatar || '/assets/images/default_avatar.jpg'});"></div>
					<span>${player2.username}</span>
				</div>
			`;
		}
	}

	getStatusClass(status) {
		return status === 0 ? 'waiting'
			: status === 1 ? 'accepted'
			: status === -1 ? 'canceled'
			: '';
	}


	renderButtons1x1(current_user) {
		const buttonsContainer = document.getElementById('match_waiting_buttons_container');

		if (buttonsContainer) {
			buttonsContainer.innerHTML = `
				<button type="button" class="btn action-btn accept">Accept</button>
				<button type="button" class="btn action-btn cancel">Cancel</button>
			`;
		}
	}

	updateStatusClasses1x1(players) {
		const modalContainer = document.getElementById('match_waiting_modal');
		if (!modalContainer) return;

		const current_user = modalContainer.getAttribute('data-current-user-1x1');

		const playerContainers = modalContainer.querySelectorAll('.player-container');
		const modalContent = modalContainer.querySelector('.modal-content');
		const actionButtons = modalContainer.querySelectorAll('.action-btn');

		let isCanceled = false;
		let currentUserStatus = null;

		players.forEach(player => {
			playerContainers.forEach(container => {
				if (container.getAttribute('data-username-1x1') === player.username) {
					container.className = `player-container ${this.getStatusClass(player.status)}`;
					if (player.status === -1) isCanceled = true;
					if (player.username === current_user) currentUserStatus = player.status;
				}
			});
		});

		if (modalContent) {
			modalContent.classList.toggle('canceled', isCanceled);
		}

		actionButtons.forEach(button => {
			button.disabled = isCanceled || (button.classList.contains('accept') && currentUserStatus === 1);
			if (!isCanceled && !button.classList.contains('accept')) {
				button.disabled = false;
			}
		});
	}


	removeBlockStatusMessage() {
		const messageInputContainer = document.getElementById('message_input_container');
		if (messageInputContainer) {
			const blockStatusMessage = messageInputContainer.querySelector('.block-status-message');
			if (blockStatusMessage) {
				blockStatusMessage.remove();
			}
		}
	}

	toggleInputState(disable) {
		const chatMessageInput = document.getElementById('chat_message_input');
		const chatMessageSubmit = document.getElementById('chat_message_submit');

		if (chatMessageInput && chatMessageSubmit) {
			chatMessageInput.disabled = disable;
			chatMessageSubmit.disabled = disable;
		}
	}

    scrollToBottom(time=0) {
        setTimeout(() => {
            const container = document.getElementById("chat_messages_container");
            if (container) {
                container.scrollTop = container.scrollHeight;
            } else {
				console.warn('chat_messages_container not found.')
			}
        }, time);
    }
}
