// 엔터 공백 줄 유지를 위해 별도 컴포넌트로 분리

export default function EditorBlank({ html }) {
  return (
    <div
      className="prose max-w-none [&_p]:my-1 [&_p:empty]:min-h-[1.2em] [&_p:empty]:block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
