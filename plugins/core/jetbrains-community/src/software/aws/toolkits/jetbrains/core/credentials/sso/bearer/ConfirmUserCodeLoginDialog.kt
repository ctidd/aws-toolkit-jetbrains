// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package software.aws.toolkits.jetbrains.core.credentials.sso.bearer

import com.intellij.icons.AllIcons
import com.intellij.openapi.actionSystem.ActionPlaces
import com.intellij.openapi.actionSystem.ActionToolbar
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.impl.ActionButton
import com.intellij.openapi.editor.colors.EditorColorsUtil
import com.intellij.openapi.ide.CopyPasteManager
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.ui.components.JBLabel
import com.intellij.ui.dsl.builder.AlignX
import com.intellij.ui.dsl.builder.panel
import com.intellij.util.ui.JBFont
import com.intellij.util.ui.components.BorderLayoutPanel
import software.aws.toolkits.core.utils.tryOrNull
import software.aws.toolkits.resources.AwsCoreBundle
import java.awt.datatransfer.StringSelection
import javax.swing.JComponent

class ConfirmUserCodeLoginDialog(
    private val authCode: String,
    dialogTitle: String,
) : DialogWrapper(null) {

    private val pane = panel {
        row {
            label(AwsCoreBundle.message("aws.sso.signing.device.code.copy.dialog.text"))
        }

        row {
            cell(
                BorderLayoutPanel(5, 0).apply {
                    val action = CopyUserCodeForLogin(authCode)
                    addToCenter(
                        JBLabel(authCode).apply {
                            tryOrNull {
                                JBFont.create(JBFont.decode(EditorColorsUtil.getGlobalOrDefaultColorScheme().consoleFontName)).biggerOn(9f).asBold()
                            }?.let {
                                font = it
                            }
                            setCopyable(true)
                        }
                    )
                    addToRight(ActionButton(action, action.templatePresentation.clone(), ActionPlaces.UNKNOWN, ActionToolbar.NAVBAR_MINIMUM_BUTTON_SIZE))
                }
            ).align(AlignX.CENTER)
        }
    }

    override fun createCenterPanel(): JComponent? = pane

    init {
        title = dialogTitle
        setOKButtonText(AwsCoreBundle.message("aws.sso.signing.device.code"))
        super.init()
    }

    override fun doCancelAction() {
        super.doCancelAction()
    }
}

class CopyUserCodeForLogin(private val authCode: String) : AnAction(AwsCoreBundle.message("aws.sso.signing.device.code.copy"), "", AllIcons.Actions.Copy) {
    override fun actionPerformed(e: AnActionEvent) {
        CopyPasteManager.getInstance().setContents(StringSelection(authCode))
    }
}
