import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

const SubModal = ({ isOpen, onClose, date, subscriptions }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Subscriptions for {date}</ModalHeader>
        <ModalBody>
          {subscriptions.length > 0 ? (
            <ul>
              {subscriptions.map((sub, index) => (
                <li key={index}>
                  {sub.name} - {sub.amount}€
                </li>
              ))}
            </ul>
          ) : (
            <p>No subscriptions for this date.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubModal;
