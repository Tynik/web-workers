import * as React from 'react';

import { useTask } from '@tynik/web-workers';

export enum FileReaderEvents {
  ONPROGRESS = 'onprogress'
}

type FileTaskHandlerResult = { filename: string, progress: number }

const ReactFilesProcessingExample = () => {
  const [progress, setProgress] = React.useState<Record<string, number>>({});

  const [task] = useTask<[FileList], FileTaskHandlerResult, FileReaderEvents>(
    function(this, files) {
      const ctx = this;

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);

        const reader = new FileReader();
        reader.onloadstart = (e: ProgressEvent<FileReader>) => {
        };
        reader.onprogress = (e: ProgressEvent<FileReader>) => {
          ctx.reply('onprogress', { filename: file.name, progress: e.loaded / e.total });
        };
        reader.onloadend = (e: ProgressEvent<FileReader>) => {
          ctx.reply('onprogress', { filename: file.name, progress: e.loaded / e.total });
        };
        reader.onabort = (e: ProgressEvent<FileReader>) => {
          console.log('onabort', e);
        };
        reader.onerror = (e: ProgressEvent<FileReader>) => {
          console.log('onerror', e);
        };
        reader.readAsDataURL(file);
      }
    }
  );

  const onFileSelectedHandler = (e) => {
    setProgress({});

    task.run(e.target.files);

    task.whenEvent(FileReaderEvents.ONPROGRESS, ({ result }) => {
      setProgress((progress) => (
        {
          ...progress,
          [result.filename]: result.progress * 100
        }
      ));
    });
  };
  return (
    <>
      <ul>
        {
          Object.keys(progress).map((filename) => (
            <li key={filename}>{filename} - {progress[filename]}%</li>
          ))
        }
      </ul>
      <input onChange={onFileSelectedHandler} type="file" multiple/>
    </>
  );
};

export default ReactFilesProcessingExample;
