import React, { useEffect, useRef } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/yaml/yaml.js";

// Editor Duplicating
// https://github.com/scniro/react-codemirror2/issues/284

// Define a custom type that extends HTMLDivElement to include the 'hydrated' property
interface CustomWrapper extends HTMLDivElement {
  hydrated: boolean;
}

interface YAMLProps {
  text: string;
  onChange: (newText: string) => void;
  error: string | undefined;
  editorHeight?: string;
  editorWidth?: string;
}

const YamlEditorComponent: React.FC<YAMLProps> = ({
  text,
  onChange,
  error,
  editorHeight = "auto",
  editorWidth = "100%",
}) => {
  const editorRef = useRef<any>(null);
  const wrapperRef = useRef<CustomWrapper | null>(null);

  // Cleanup function to remove editor DOM and reset hydration state
  const editorWillUnmount = () => {
    if (editorRef.current && editorRef.current.editor && editorRef.current.editor.display) {
      const editorWrapper = editorRef.current.editor.display.wrapper;
      if (editorWrapper) editorWrapper.remove();
    }
    if (wrapperRef.current) {
      wrapperRef.current.hydrated = false;
    }
  };

  return (
    <div ref={wrapperRef}>
      <div style={{ width: editorWidth, height: editorHeight, overflow: "auto" }}>
        <CodeMirror
          ref={editorRef}
          value={text}
          options={{
            mode: "yaml",
            lineNumbers: true,
            theme: "default",
          }}
          onChange={(editor, data, value) => {
            onChange(value);
          }}
          editorDidMount={(e) => (editorRef.current = e)}
          editorWillUnmount={editorWillUnmount}
        />
      </div>
      {error && <div style={{ color: "red", marginTop: "8px" }}>{error}</div>}
    </div>
  );
};

export default YamlEditorComponent;
