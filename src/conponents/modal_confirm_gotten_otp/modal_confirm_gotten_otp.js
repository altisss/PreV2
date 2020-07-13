import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import React from 'react'

const ModalConfirmGottenOTP = (props) => {
	const { t, cfm_inform_otp, reqDepositFlag, modalAfterOpened, modalModalClose, confirm_gotten_otp, content_header, content_body } = props;
	

	return (
        <Modal  isOpen={cfm_inform_otp}
                size={"sm modal-notify"}
                onClosed={modalModalClose}
                onOpened={modalAfterOpened}>
            <ModalHeader>
                { !content_header ? t('common_notify') : content_header}
            </ModalHeader>

            <ModalBody>
                { !content_body ? t('You_are_not_authentication_OTP') : content_body}
            </ModalBody>

            <ModalFooter>
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <Button size="sm" block
                            id="bt_sendInformToDepositOk"
                            autoFocus
                            color="wizard"
                            onClick={(e) => confirm_gotten_otp('OK')}>
                            {reqDepositFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_confirm')}</span>}
                            </Button>
                        </div>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    )
}
export { ModalConfirmGottenOTP};