import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import i18n from '../../translate/i18n';
const AlertModal = props => {
  return (
    <Modal
      isOpen={props.modalShow}
      size={props.size + ' modal-notify '}
      onClosed={props.afterClose}
      onOpened={props.afterOpened}
      id='modalSystem'
      className={props.className}>
      <ModalHeader>
        {props.title}
      </ModalHeader>
      <ModalBody>
        {props.content}
      </ModalBody>
      <ModalFooter>
        <div className='col'>
          <Button id="alertBtnId" color={props.btnType} size="sm" block onClick={props.modalClose}>
            {i18n.t(props.textButton)}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default AlertModal;
