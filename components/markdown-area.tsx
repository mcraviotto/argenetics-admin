"use client";

import { locales } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  BasicTextStyleButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  useCreateBlockNote
} from "@blocknote/react";
import { useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";

export default function Editor({ setValue, initialValue }: {
  setValue: UseFormSetValue<any>;
  initialValue?: string;
}) {

  const locale = locales["es"];

  const editor = useCreateBlockNote({
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        default: "Escribe aquí...",
      },
    },
  });

  useEffect(() => {
    if (!initialValue) return;

    (async () => {
      const blocks = await editor.tryParseMarkdownToBlocks(initialValue);
      editor.replaceBlocks(editor.document, blocks);
    })();
  }, [editor]);

  return <BlockNoteView
    editor={editor}
    className="rounded-md py-1.5 bg-secondary"
    theme="light"
    slashMenu={false}
    sideMenu={false}
    formattingToolbar={false}
    onChange={async () => {
      setValue("body", await editor.blocksToMarkdownLossy(editor.document));
    }}
    data-theming
  >
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar>

          <FileCaptionButton key={"fileCaptionButton"} />
          <FileReplaceButton key={"replaceFileButton"} />

          <BasicTextStyleButton
            basicTextStyle={"bold"}
            key={"boldStyleButton"}
          />
          <BasicTextStyleButton
            basicTextStyle={"italic"}
            key={"italicStyleButton"}
          />
          <BasicTextStyleButton
            basicTextStyle={"underline"}
            key={"underlineStyleButton"}
          />
          <BasicTextStyleButton
            basicTextStyle={"strike"}
            key={"strikeStyleButton"}
          />
        </FormattingToolbar>
      )}
    />
  </BlockNoteView>
}