import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Chip
} from "@nextui-org/react"; // Adjust this import based on your actual package
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react"; // Importing the modal components

import Shipimo from "./Shipimo";
import Invoico from "./Invoico";
import { useGlobalContext } from "./GlobalProvider";
function Customers() {
  // Call the `Strip` hook properly

  const [page, setPage] = useState(1);
  const [activeContent, setActiveContent] = useState("Shipments"); 
  const { isOpen, onOpen, onClose } = useDisclosure(); // Using useDisclosure
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState(null);
  const rowsPerPage = 10;
  const { shipments, users, subscriptions, invoices,subscriptionsreal } = useGlobalContext();
  console.log("users",users)
  // Memoize the pages calculation
  const pages = useMemo(() => {
    return subscriptionsreal?.length
      ? Math.ceil(subscriptionsreal.length / rowsPerPage)
      : 0;
  }, [subscriptionsreal, rowsPerPage]);

  // Memoize the current subscriptions for the table
  const currentSubscriptions = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return subscriptionsreal?.slice(startIndex, endIndex) || [];
  }, [page, subscriptionsreal]);



  function getUserCapacity(selectedCustomerEmail) {
    // Extract email from selectedCustomerEmail
    const emailMatch = selectedCustomerEmail.match(/\(([^)]+)\)/);
    const email = emailMatch ? emailMatch[1] : null;

    if (!email) {
        throw new Error("Invalid email format");
    }

    // Find the user by email
    const user = users.find(u => u.email === email);
    
    // Return the user's capacity or null if not found
    return user ? user.capacity : null;
}
  // Function to get a subscription by ID
  const getSubscriptionById = (id) => {
    const matchedSubscription = subscriptions.find(
      (subscription) => subscription.id === id
    );
    return matchedSubscription
      ? `${matchedSubscription.name} : (${matchedSubscription.email})`
      : "No matching subscription";
  };
  const getSubscriptionById2 = (id) => {
    const matchedSubscription = subscriptions.find(
      (subscription) => subscription.id === id
    );
    return matchedSubscription
      ? `${matchedSubscription.created}`
      : "No matching subscription";
  };

  // Function to get the number of invoices for a customer
  const getInvoiceCountByCustomer = (customerEmail) => {
    if (!invoices || invoices.length === 0) return 0;
    return invoices.filter((invoice) => invoice.customer_email === customerEmail).length;
  };
  const getTotalInvoiceAmountByCustomer = (customerEmail) => {
    if (!invoices || invoices.length === 0) return 0;
  
    return invoices
      .filter((invoice) => invoice.customer_email === customerEmail) // Filter invoices by customer email
      .reduce((total, invoice) => {
        const amount = invoice.lines?.data?.[0]?.amount || 0; // Safely access the amount
        return total + amount;
      }, 0); // Sum up the amounts
  };

  const handleRowClick = (customerEmail) => {
    setSelectedCustomerEmail(customerEmail); // Set the selected customer's email
    onOpen(); // Open the modal
  };

  const loadingState =
    !subscriptionsreal || subscriptionsreal.length === 0 || invoices.length === 0 ? "loading" : "idle";

  if (loadingState === "loading") {
    return (
      <div className="flex items-center justify-center">
        <Spinner size="lg" color="primary" />
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="p-6 px-20">
   
      <Table
        classNames={{
          
          wrapper: "h-[630px] dark",
        }}
        aria-label="Stripe Subscriptions Table"
        bottomContent={
          pages > 0 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="warning"
                page={page}
                total={pages}
                onChange={(newPage) => setPage(newPage)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader  className="dark">
          <TableColumn>Email</TableColumn>
          <TableColumn>Purchased After</TableColumn>
          <TableColumn>Plan</TableColumn>
          <TableColumn>Planddd</TableColumn>
          <TableColumn>START DATE</TableColumn>
      
          <TableColumn>CANCEL AT PERIOD END</TableColumn>
          <TableColumn>CURRENT PERIOD START</TableColumn>
          <TableColumn>CURRENT PERIOD END</TableColumn>
          <TableColumn>Invoices Count</TableColumn>
          <TableColumn>total amount</TableColumn>
          
        </TableHeader>
        <TableBody items={currentSubscriptions} className="" >
        {(item) => {
            const customerEmail = getSubscriptionById(item.customer);
            return (
              <TableRow
                key={item.id}
                className="cursor-pointer text-gray-400 hover:bg-gray-600 hover:text-gray-100 hover:rounded-full "
                onClick={() => handleRowClick(customerEmail)} // Open modal on row click
              >
              <TableCell>{getSubscriptionById(item.customer)}</TableCell>
              <TableCell>
                {(() => {
                  const startDate = new Date(item.start_date * 1000);
                  const subscriptionDate = new Date(getSubscriptionById2(item.customer) * 1000);
                  const timeDifference = startDate - subscriptionDate;

                  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Days
                  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // Hours
                  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)); // Minutes

                  return `${days}d ${hours}h ${minutes}m`; // Format the result as "Xd Xh Xm"
                })()}
              </TableCell>
              <TableCell>
                {(item.items?.data?.[0]?.plan?.amount)/100  }-  {item.items?.data?.[0]?.plan?.interval}
              </TableCell>
              <TableCell>
                {item.items?.data?.[0]?.plan?.interval_count}
              </TableCell>
              <TableCell>
                {new Date(item.start_date * 1000).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </TableCell>
              <TableCell>
              <Chip
                color={item.cancel_at_period_end ? 'danger' : 'success'}
                variant="flat"
              >
                {item.cancel_at_period_end ? 'Yes' : 'No'}
              </Chip>
            </TableCell>
            <TableCell>
              {new Date(item.current_period_start * 1000).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </TableCell>
            <TableCell>
              {new Date(item.current_period_end * 1000).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </TableCell>

              <TableCell>
                {getInvoiceCountByCustomer(
                  subscriptions.find((sub) => sub.id === item.customer)?.email || ""
                )}
              </TableCell>
              <TableCell>
                {getTotalInvoiceAmountByCustomer(
                  subscriptions.find((sub) => sub.id === item.customer)?.email || ""
                )/100}
              </TableCell>
              
            </TableRow>
          );
        }}
        </TableBody>
      </Table>
      
      <Modal isOpen={isOpen} onOpenChange={onClose} className="dark text-gray-100 h-[630px]" size="4xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-start mt-2 gap-1 h-[40px]">
              Customer Shipments --- <p className="text-sm text-gray-400"> {selectedCustomerEmail}</p>
            </ModalHeader>
            <ModalBody>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div>
                <Button

                 color={`${activeContent === "Shipments"? "warning": "success"}`}
          className="rounded-tl-lg rounded-bl-lg w-[100px]"
                 radius="none"
                 variant={`${activeContent === "Shipments"? "solid": "flat"}`}
                  onPress={() => setActiveContent("Shipments")}
                >
                  Shipments
                </Button>
                <Button
         radius="none"
                variant={`${activeContent === "Invoices"? "solid": "flat"}`}
                className="rounded-tr-lg rounded-br-lg w-[100px]"
                color={`${activeContent === "Invoices"? "warning": "success"}`}
                  onPress={() => setActiveContent("Invoices")}
                >
                  Invoices
                </Button>
                </div>
              </div>

              {activeContent === "Shipments" && (
                <div >
                 <span className="ml-4 mb-6">Current Caparity: {getUserCapacity(selectedCustomerEmail)}</span>
                  <Shipimo shipments={shipments} email={selectedCustomerEmail}/>
                </div>
              )}

              {activeContent === "Invoices" && (
                <div>
                 <Invoico email={selectedCustomerEmail} invoices={invoices} subscriptions={subscriptions}/>
                </div>
              )}
            </ModalBody>
          
          </>
        )}
      </ModalContent>
    </Modal>
    </div>
  );
}

export default Customers;
