import Quill, { type QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import {
  type MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";
import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { ImageIcon, Smile, XIcon } from "lucide-react";
import { Hint } from "./hint";
import type { Delta, Op } from "quill/core";
import { cn } from "@/lib/utils";
import { type Emoji, EmojiPopover } from "./emoji-popover";
import Image from "next/image";
import { doesInputTextExistIgnoreHTML } from "@/lib/utils";

type EditorValue = {
  image: File | null;
  body: string;
};

type EditorProps = {
  variant?: "create" | "update";
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
};

const Editor = ({
  variant = "create",
  onSubmit,
  onCancel,
  placeholder = "Write something...",
  defaultValue = [],
  disabled = false,
  innerRef,
}: EditorProps) => {
  // state for rerenders since the refs will not trigger any
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  // use refs so we can use in Effect without causing re-renders
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);
  const quillRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLInputElement | null>(null);

  // update refs if needed, without causing rerenders
  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef || !containerRef.current) return;
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container?.ownerDocument.createElement("div"),
    );

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ], // limit toolbar buttons

        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const addedImage = imageElementRef.current?.files?.[0] || null;
                const isEmpty =
                  !addedImage && doesInputTextExistIgnoreHTML(text);

                if (isEmpty) return;

                const body = JSON.stringify(quill.getContents());

                submitRef.current?.({ body, image: addedImage });

                return;
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                // insert new line at current index or 0 if no index
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editorContainer, options);
    // allow us to access quill outside of the effect
    quillRef.current = quill;
    quillRef.current.focus();

    // allow control from outside of the component
    if (innerRef) innerRef.current = quill;

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => setText(quill.getText()));

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) container.innerHTML = "";
      if (quillRef.current) quillRef.current = null;
    };
  }, [innerRef]);

  const toggleToolbar = () => {
    setIsToolbarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");
    if (toolbarElement) toolbarElement.classList.toggle("hidden");
  };

  const onEmojiSelect = (emoji: Emoji) => {
    const quill = quillRef.current;
    // add emoji to the end of the editor text.
    quill?.insertText(quill?.getSelection()?.index || 0, emoji);
  };

  const isEmpty = !image && doesInputTextExistIgnoreHTML(text);

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={imageElementRef}
        onChange={(e) => {
          const file = e.target.files?.[0]; // Optional chaining to safely access the file
          if (file) {
            setImage(file); // Only set the image if there's a valid file
          } else {
            setImage(null); // Handle case where no file is selected
          }
        }}
        className="hidden"
      />
      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white",
          disabled && "opacity-50",
        )}
      >
        <div ref={containerRef} className="w-full ql-custom" />
        {!!image && (
          <div className="p-2 ">
            <div className="relative size-[62px] flex items-center justify-center group/image">
              <Hint label="Remove image">
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    if (imageElementRef.current)
                      imageElementRef.current.value = "";
                  }}
                  className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 items-center justify-center"
                >
                  <XIcon className="size-3.5" />
                </button>
              </Hint>

              <Image
                src={URL.createObjectURL(image)}
                alt="uploaded image"
                fill
                className="rounded-xl overflow-hidden border object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex px-2 pb-2 z-[5]">
          <Hint
            label={isToolbarVisible ? "Hide formatting" : "Show formatting"}
          >
            <Button
              className=""
              size="iconSm"
              disabled={disabled}
              variant="ghost"
              onClick={toggleToolbar}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>

          {/* Emoji  */}
          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button
              className=""
              size="iconSm"
              disabled={disabled}
              variant="ghost"
            >
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>

          {variant === "create" && (
            <Hint label="Insert image">
              <Button
                className=""
                size="iconSm"
                disabled={disabled}
                variant="ghost"
                // simulate clicking on the hidden input.
                onClick={() => imageElementRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                className=""
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                variant="outline"
                size="sm"
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }
                disabled={disabled || isEmpty}
              >
                Save
              </Button>
            </div>
          )}
          {variant === "create" && (
            <Hint label="Submit">
              <Button
                className={cn(
                  "ml-auto",
                  isEmpty
                    ? "bg-white hover:bg-white text-muted-foreground"
                    : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white",
                )}
                size="iconSm"
                disabled={disabled || isEmpty}
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }
              >
                <MdSend className="size-4" />
              </Button>
            </Hint>
          )}
        </div>
      </div>
      {variant === "create" && (
        <div
          className={cn(
            "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition",
            !isEmpty && "opacity-100",
          )}
        >
          <p>
            <strong>Shift + Return</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
};

export default Editor;
