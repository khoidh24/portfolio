"use client";

import { JSX } from "react";
import ReactMarkdown, { ExtraProps } from "react-markdown";

import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import "katex/dist/katex.min.css";
import Image from "next/image";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { getImgUrl } from "@/utils/getImgUrl";

import "./view.css";

type Props = {
  doc: string;
  titleForSEO: string;
};

const View: React.FC<Props> = ({ doc, titleForSEO }) => {
  const markdown = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeSlug, rehypeHighlight]}
      components={{
        a: ({ ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
        img: ({ ...props }) => {
          const imageUrl = getImgUrl(props.src as string);
          return imageUrl ? (
            <Image
              {...props}
              className="my-2 h-full w-auto rounded-md object-contain object-center"
              loading="lazy"
              width={1080}
              height={608}
              title={`${props.alt} - ${titleForSEO}`}
              alt={props.alt as string}
              src={imageUrl}
            />
          ) : null;
        },
        code: (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
          const { children, className } = props;
          const match = /language-(\w+)/.exec(className || "");
          const lang = match?.[1];
          const isBlock = Boolean(match);

          if (!isBlock) {
            return <code className="inline-code">{children}</code>;
          }

          return (
            <div className="code-block-wrapper relative p-4">
              {lang && (
                <div className="code-lang absolute top-0 right-0 rounded-bl-md bg-neutral-600 px-2 py-1 text-sm text-gray-200 opacity-80">
                  {lang}
                </div>
              )}
              <pre
                className={`mb-0! overflow-x-auto rounded-md bg-transparent! p-0 ${className || ""}`}
              >
                <code>{children}</code>
              </pre>
            </div>
          );
        },
        table: ({ ...props }) => (
          <div className="table-scroll">
            <table {...props} />
          </div>
        ),
      }}
    >
      {doc}
    </ReactMarkdown>
  );

  return (
    <div className="markdown-body">
      <div className="markdown-content px-0 pb-4">{markdown}</div>
    </div>
  );
};

export default View;
