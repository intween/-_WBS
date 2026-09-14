import { useState } from 'react';
import { Button, Icon, Modal } from '@/components/common';
import { useTaskActions, useUi, useUiActions } from '@/context/hooks';
import FilterPopover from './FilterPopover';
import OverflowMenu from './OverflowMenu';
import SearchField from './SearchField';
import TaskFormModal from './TaskFormModal';
import './Toolbar.scss';

const RESET_CONFIRM = 'reset';

const Toolbar = () => {
  const { confirm } = useUi();
  const { closeConfirm, selectTask } = useUiActions();
  const { resetAll, createTask } = useTaskActions();
  const [isAdding, setIsAdding] = useState(false);

  const handleReset = () => {
    closeConfirm();
    resetAll();
  };

  const handleCreate = async (draft) => {
    const created = await createTask(draft);
    // 추가하자마자 상세를 열어 바로 이어서 입력할 수 있게 한다.
    if (created) selectTask(created.id);
    return created;
  };

  return (
    <div className="toolbar">
      <div className="toolbar__center">
        <SearchField />
      </div>

      <div className="toolbar__actions">
        <Button variant="outline" className="toolbar__create" onClick={() => setIsAdding(true)}>
          <span className="toolbar__add">
            <Icon name="plus" size={14} />
            업무 추가
          </span>
        </Button>
        <FilterPopover />
        <OverflowMenu />
      </div>

      <Button
        variant="primary"
        className="toolbar__fab"
        aria-label="업무 추가"
        title="업무 추가"
        onClick={() => setIsAdding(true)}
      >
        <Icon name="plus" size={18} />
      </Button>

      <TaskFormModal isOpen={isAdding} onSubmit={handleCreate} onClose={() => setIsAdding(false)} />

      <Modal
        isOpen={confirm === RESET_CONFIRM}
        title="진행 상태를 초기화할까요"
        description="상태, 마감일 변경, 체크리스트, 링크, 메모가 모두 지워집니다. 되돌릴 수 없습니다"
        confirmLabel="초기화"
        tone="danger"
        onConfirm={handleReset}
        onClose={closeConfirm}
      />
    </div>
  );
};

export default Toolbar;
