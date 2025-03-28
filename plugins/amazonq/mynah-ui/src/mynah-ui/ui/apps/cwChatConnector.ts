/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {ChatItemAction, ChatItemType, FeedbackPayload, QuickActionCommand} from '@aws/mynah-ui-chat'
import { ExtensionMessage } from '../commands'
import { CodeReference } from './amazonqCommonsConnector'
import { TabOpenType, TabsStorage } from '../storages/tabsStorage'
import { FollowUpGenerator } from '../followUps/generator'
import { CWCChatItem } from "../connector";

interface ChatPayload {
    chatMessage: string
    chatCommand?: string
}

export interface ConnectorProps {
    sendMessageToExtension: (message: ExtensionMessage) => void
    onMessageReceived?: (tabID: string, messageData: any, needToShowAPIDocsTab: boolean) => void
    onChatAnswerReceived?: (tabID: string, message: CWCChatItem) => void
    onCWCContextCommandMessage: (message: CWCChatItem, command?: string) => string | undefined
    onError: (tabID: string, message: string, title: string) => void
    onWarning: (tabID: string, message: string, title: string) => void
    onOpenSettingsMessage: (tabID: string) => void
    onFeatureConfigsAvailable: (
        highlightCommand?: QuickActionCommand
    ) => void
    tabsStorage: TabsStorage
}

export class Connector {
    private readonly sendMessageToExtension
    private readonly onError
    private readonly onWarning
    private readonly onChatAnswerReceived
    private readonly onCWCContextCommandMessage
    private readonly onOpenSettingsMessage
    private readonly onFeatureConfigsAvailable
    private readonly followUpGenerator: FollowUpGenerator

    constructor(props: ConnectorProps) {
        this.sendMessageToExtension = props.sendMessageToExtension
        this.onChatAnswerReceived = props.onChatAnswerReceived
        this.onWarning = props.onWarning
        this.onError = props.onError
        this.onCWCContextCommandMessage = props.onCWCContextCommandMessage
        this.onOpenSettingsMessage = props.onOpenSettingsMessage
        this.onFeatureConfigsAvailable = props.onFeatureConfigsAvailable
        this.followUpGenerator = new FollowUpGenerator()
    }

    onSourceLinkClick = (tabID: string, messageId: string, link: string): void => {
        this.sendMessageToExtension({
            command: 'source-link-click',
            tabID,
            messageId,
            link,
            tabType: 'cwc',
        })
    }
    onResponseBodyLinkClick = (tabID: string, messageId: string, link: string): void => {
        this.sendMessageToExtension({
            command: 'response-body-link-click',
            tabID,
            messageId,
            link,
            tabType: 'cwc',
        })
    }
    onInfoLinkClick = (tabID: string, link: string): void => {
        this.sendMessageToExtension({
            command: 'footer-info-link-click',
            tabID,
            link,
            tabType: 'cwc',
        })
    }

    followUpClicked = (tabID: string, messageId: string, followUp: ChatItemAction): void => {
        this.sendMessageToExtension({
            command: 'follow-up-was-clicked',
            followUp,
            tabID,
            messageId,
            tabType: 'cwc',
        })
    }

    onTabAdd = (tabID: string, tabOpenInteractionType?: TabOpenType): void => {
        this.sendMessageToExtension({
            tabID: tabID,
            command: 'new-tab-was-created',
            tabType: 'cwc',
            tabOpenInteractionType,
        })
    }

    onCodeInsertToCursorPosition = (
        tabID: string,
        messageId: string,
        code?: string,
        type?: 'selection' | 'block',
        codeReference?: CodeReference[],
        eventId?: string,
        codeBlockIndex?: number,
        totalCodeBlocks?: number,
        userIntent?: string,
        codeBlockLanguage?: string,
    ): void => {
        this.sendMessageToExtension({
            tabID: tabID,
            messageId,
            code,
            command: 'insert_code_at_cursor_position',
            tabType: 'cwc',
            insertionTargetType: type,
            codeReference,
            eventId,
            codeBlockIndex,
            totalCodeBlocks,
            userIntent,
            codeBlockLanguage
        })
    }

    onCopyCodeToClipboard = (
        tabID: string,
        messageId: string,
        code?: string,
        type?: 'selection' | 'block',
        codeReference?: CodeReference[],
        eventId?: string,
        codeBlockIndex?: number,
        totalCodeBlocks?: number,
        userIntent?: string,
        codeBlockLanguage?: string,
    ): void => {
        this.sendMessageToExtension({
            tabID: tabID,
            messageId,
            code,
            command: 'code_was_copied_to_clipboard',
            tabType: 'cwc',
            insertionTargetType: type,
            codeReference,
            eventId,
            codeBlockIndex,
            totalCodeBlocks,
            userIntent,
            codeBlockLanguage
        })
    }

    onTabRemove = (tabID: string): void => {
        this.sendMessageToExtension({
            tabID: tabID,
            command: 'tab-was-removed',
            tabType: 'cwc',
        })
    }

    onTabChange = (tabID: string, prevTabID?: string) => {
        this.sendMessageToExtension({
            tabID: tabID,
            command: 'tab-was-changed',
            tabType: 'cwc',
            prevTabID,
        })
    }

    onStopChatResponse = (tabID: string): void => {
        this.sendMessageToExtension({
            tabID: tabID,
            command: 'stop-response',
            tabType: 'cwc',
        })
    }

    onChatItemVoted = (tabID: string, messageId: string, vote: 'upvote' | 'downvote'): void => {
        this.sendMessageToExtension({
            tabID: tabID,
            command: 'chat-item-voted',
            messageId,
            vote,
            tabType: 'cwc',
        })
    }
    onSendFeedback = (tabID: string, feedbackPayload: FeedbackPayload): void | undefined => {
        this.sendMessageToExtension({
            command: 'chat-item-feedback',
            ...feedbackPayload,
            tabType: 'cwc',
            tabID: tabID,
        })
    }

    requestGenerativeAIAnswer = (tabID: string, payload: ChatPayload): Promise<any> =>
        new Promise((resolve, reject) => {
            this.sendMessageToExtension({
                tabID: tabID,
                command: 'chat-prompt',
                chatMessage: payload.chatMessage,
                chatCommand: payload.chatCommand,
                tabType: 'cwc',
            })
        })

    clearChat = (tabID: string): void => {
        this.sendMessageToExtension({
            tabID: tabID,
            command: 'clear',
            chatMessage: '',
            tabType: 'cwc',
        })
    }

    help = (tabID: string): void => {
        this.sendMessageToExtension({
            tabID: tabID,
            command: 'help',
            chatMessage: '',
            tabType: 'cwc',
        })
    }

    private sendTriggerMessageProcessed = async (requestID: any): Promise<void> => {
        this.sendMessageToExtension({
            command: 'trigger-message-processed',
            requestID: requestID,
            tabType: 'cwc',
        })
    }

    private processEditorContextCommandMessage = async (messageData: any): Promise<void> => {
        const triggerTabID = this.onCWCContextCommandMessage(
            {
                body: messageData.message,
                type: ChatItemType.PROMPT,
            },
            messageData.command
        )
        this.sendTriggerTabIDReceived(
            messageData.triggerID,
            triggerTabID !== undefined ? triggerTabID : 'no-available-tabs'
        )
    }

    private sendTriggerTabIDReceived = async (triggerID: string, tabID: string): Promise<void> => {
        this.sendMessageToExtension({
            command: 'trigger-tabID-received',
            triggerID,
            tabID,
            tabType: 'cwc',
        })
    }

    private processChatMessage = async (messageData: any): Promise<void> => {
        if (this.onChatAnswerReceived === undefined) {
            return
        }
        if (
            messageData.message !== undefined ||
            messageData.relatedSuggestions !== undefined ||
            messageData.codeReference !== undefined
        ) {
            const followUps =
                messageData.followUps !== undefined && messageData.followUps.length > 0
                    ? {
                          text: messageData.followUpsHeader ?? 'Suggested follow up questions:',
                          options: messageData.followUps,
                      }
                    : undefined

            const answer: CWCChatItem = {
                type: messageData.messageType,
                messageId: messageData.messageId ?? messageData.triggerID,
                body: messageData.message,
                followUp: followUps,
                canBeVoted: true,
                codeReference: messageData.codeReference,
                userIntent: messageData.userIntent,
                codeBlockLanguage: messageData.codeBlockLanguage,
            }

            // If it is not there we will not set it
            if (messageData.messageType === 'answer-part' || messageData.messageType === 'answer') {
                answer.canBeVoted = true
            }

            if (messageData.relatedSuggestions !== undefined) {
                answer.relatedContent = {
                    title: 'Sources',
                    content: messageData.relatedSuggestions,
                }
            }
            this.onChatAnswerReceived(messageData.tabID, answer)

            // Exit the function if we received an answer from AI
            if (
                messageData.messageType === ChatItemType.SYSTEM_PROMPT ||
                messageData.messageType === ChatItemType.AI_PROMPT
            ) {
                await this.sendTriggerMessageProcessed(messageData.requestID)
            }

            return
        }
        if (messageData.messageType === ChatItemType.ANSWER) {
            const answer: CWCChatItem = {
                type: messageData.messageType,
                body: undefined,
                relatedContent: undefined,
                messageId: messageData.messageId,
                codeReference: messageData.codeReference,
                userIntent: messageData.userIntent,
                codeBlockLanguage: messageData.codeBlockLanguage,
                followUp:
                    messageData.followUps !== undefined && messageData.followUps.length > 0
                        ? {
                              text: 'Suggested follow up questions:',
                              options: messageData.followUps,
                          }
                        : undefined,
            }
            this.onChatAnswerReceived(messageData.tabID, answer)

            return
        }
    }

    private processAuthNeededException = async (messageData: any): Promise<void> => {
        if (this.onChatAnswerReceived === undefined) {
            return
        }

        this.onChatAnswerReceived(messageData.tabID, {
            type: ChatItemType.ANSWER,
            messageId: messageData.triggerID,
            body: messageData.message,
            followUp: this.followUpGenerator.generateAuthFollowUps('cwc', messageData.authType),
            canBeVoted: false,
        })

        return
    }

    private processOpenSettingsMessage = async (messageData: any): Promise<void> => {
        this.onOpenSettingsMessage(messageData.tabID)
    }

    handleMessageReceive = async (messageData: any): Promise<void> => {
        if (messageData.type === 'errorMessage') {
            this.onError(messageData.tabID, messageData.message, messageData.title)
            return
        }
        if (messageData.type === 'showInvalidTokenNotification') {
            this.onWarning(messageData.tabID, messageData.message, messageData.title)
            return
        }

        if (messageData.type === 'chatMessage') {
            await this.processChatMessage(messageData)
            return
        }

        if (messageData.type === 'editorContextCommandMessage') {
            await this.processEditorContextCommandMessage(messageData)
            return
        }

        if (messageData.type === 'authNeededException') {
            await this.processAuthNeededException(messageData)
            return
        }

        if (messageData.type === 'openSettingsMessage') {
            await this.processOpenSettingsMessage(messageData)
            return
        }

        if (messageData.type === 'featureConfigsAvailableMessage') {
            this.onFeatureConfigsAvailable(
                messageData.highlightCommand,
            )
            return
        }
    }
}
