import { Modal } from '@/components/common';
import { useTaskActions, useUi, useUiActions } from '@/context/hooks';
import FilterPopover from './FilterPopover';
import OverflowMenu from './OverflowMenu';
import SearchField from './SearchField';
import './Toolbar.scss';

const RESET_CONFIRM = 'reset';

const Toolbar = () => {
  const { confirm } = useUi();
  const { closeConfirm } = useUiActions();
  const { resetAll } = useTaskActions();

  const handleReset = () => {
    closeConfirm();
    resetAll();
  };

  return (
    <div className="toolbar">
      <div className="toolbar__center">
        <SearchField />
      </div>

      <div className="toolbar__actions">
        <FilterPopover />
        <OverflowMenu />
      </div>

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
