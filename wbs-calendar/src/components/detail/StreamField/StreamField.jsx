import { Select } from '@/components/common';
import { STREAMS } from '@/config';
import { useTaskActions } from '@/context/hooks';

const OPTIONS = STREAMS.map((stream) => ({ value: stream.id, label: stream.name }));

const StreamField = ({ task }) => {
  const { editTask } = useTaskActions();

  return (
    <Select
      value={task.stream}
      options={OPTIONS}
      ariaLabel="워크스트림"
      onChange={(stream) => {
        if (stream !== task.stream) editTask(task.id, { stream });
      }}
    />
  );
};

export default StreamField;
