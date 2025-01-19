declare module 'file-saver' {
  const FileSaver: {
    saveAs: (data: Blob, filename?: string, options?: Object) => void;
  };
  export default FileSaver;
}

