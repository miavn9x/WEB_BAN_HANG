import React from "react";
import { Editor } from "@tinymce/tinymce-react";

const MyEditor = () => {
  const handleEditorChange = (content, editor) => {
    console.log("Content was updated:", content);
  };

  return (
    <Editor
      apiKey="8t813kgqzmwjgis1zt15s0ez32c6qagtx9ikfwwfusk0nj9j"
      initialValue="<p>Some initial content</p>"
      init={{
        height: 500,
        menubar: false,
        plugins:
          "advlist autolink lists link image charmap print preview anchor",
        toolbar:
          "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default MyEditor;
