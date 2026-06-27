import React from 'react'
import { Modal, Button } from '../../../shared/ui'
import styles from './DeleteCalendarModal.module.scss'

interface Props {
  calendarName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteCalendarModal = ({ calendarName, onConfirm, onClose }: Props) => {
  return (
    <Modal isOpen title="Delete calendar" onClose={onClose}>
      <div className={styles.content}>
        <p>
          Are you sure you want to delete <strong>{calendarName}</strong>?
          You'll no longer have access to this calendar and its events.
        </p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="error" onClick={() => { onConfirm(); onClose() }}>Delete</Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteCalendarModal
