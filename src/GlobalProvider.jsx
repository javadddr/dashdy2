// GlobalContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

// Create the context
const GlobalContext = createContext();

// Create the provider component
const GlobalProvider = ({ children }) => {
  const [shipments, setShipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsreal, setSubscriptionsreal] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allsubs, setAllsubs] = useState([]);

const keyfrom = import.meta.env.VITE_USER_KEY;

  // Fetch shipments
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const now = new Date();
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        const start = threeMonthsAgo.getTime();
        const end = now.getTime();

        const response = await fetch(
          `https://api2.globalpackagetracker.com/shipment/getAll?start=${start}&end=${end}`,
          {
            headers: { key:import.meta.env.VITE_USER_KEY},
          }
        );

        const data = await response.json();
        setShipments(data.documents || []);
      } catch (error) {
        console.error("Error fetching shipments:", error);
      }
    };

    fetchShipments();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://api.globalpackagetracker.com/user/get", {
          headers: { key:import.meta.env.VITE_USER_KEY},
        });

        const data = await response.json();
        setUsers(data.documents || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchSubscriptionsreal = async () => {
      let allSubscriptions = []; // To store all subscriptions
      let hasMore = true; // To track if there are more pages
      let startingAfter = null; // To track the last subscription ID for pagination

      try {
        while (hasMore) {
          const url = new URL('https://api.stripe.com/v1/subscriptions');
          if (startingAfter) {
            url.searchParams.append('starting_after', startingAfter);
          }

          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`, // Use Vite's meta.env for secret key
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch subscriptions');
          }

          const data = await response.json();
          allSubscriptions = [...allSubscriptions, ...data.data]; // Append the fetched data to the array
          hasMore = data.has_more; // Update hasMore based on the response
          if (hasMore) {
            startingAfter = data.data[data.data.length - 1].id; // Set the last subscription ID for the next page
          }
        }

        setSubscriptionsreal(allSubscriptions); // Save all subscriptions to state
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    fetchSubscriptionsreal();
  }, []); // Run once when the component mounts


  // Fetch subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      let allSubscriptions = [];
      let hasMore = true;
      let startingAfter = null;

      try {
        while (hasMore) {
          const url = new URL("https://api.stripe.com/v1/customers?limit=100");
          if (startingAfter) {
            url.searchParams.append("starting_after", startingAfter);
          }

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}` },
          });

          const data = await response.json();
          allSubscriptions = [...allSubscriptions, ...data.data];
          hasMore = data.has_more;

          if (hasMore) {
            startingAfter = data.data[data.data.length - 1].id;
          }
        }

        setSubscriptions(allSubscriptions);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchSubscriptions();
  }, []);

  // Fetch all subscriptions
  useEffect(() => {
    const fetchAllSubscriptions = async () => {
      let allSubscriptions = [];
      let hasMore = true;
      let startingAfter = null;

      try {
        while (hasMore) {
          const url = new URL("https://api.stripe.com/v1/subscriptions?status=all");
          if (startingAfter) {
            url.searchParams.append("starting_after", startingAfter);
          }

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}` },
          });

          const data = await response.json();
          allSubscriptions = [...allSubscriptions, ...data.data];
          hasMore = data.has_more;

          if (hasMore) {
            startingAfter = data.data[data.data.length - 1].id;
          }
        }

        setAllsubs(allSubscriptions);
      } catch (error) {
        console.error("Error fetching all subscriptions:", error);
      }
    };

    fetchAllSubscriptions();
  }, []);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      let allInvoices = [];
      let hasMore = true;
      let startingAfter = null;

      try {
        while (hasMore) {
          const url = new URL("https://api.stripe.com/v1/invoices");
          if (startingAfter) {
            url.searchParams.append("starting_after", startingAfter);
          }

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}` },
          });

          const data = await response.json();
          allInvoices = [...allInvoices, ...data.data];
          hasMore = data.has_more;

          if (hasMore) {
            startingAfter = data.data[data.data.length - 1].id;
          }
        }

        setInvoices(allInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      let allTransactions = [];
      let hasMore = true;
      let startingAfter = null;

      try {
        while (hasMore) {
          const url = new URL("https://api.stripe.com/v1/charges");
          if (startingAfter) {
            url.searchParams.append("starting_after", startingAfter);
          }

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}` },
          });

          const data = await response.json();
          allTransactions = [...allTransactions, ...data.data];
          hasMore = data.has_more;

          if (hasMore) {
            startingAfter = data.data[data.data.length - 1].id;
          }
        }

        setTransactions(allTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        shipments,
        users,
        subscriptions,
        subscriptionsreal,
        invoices,
        transactions,
        allsubs,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the GlobalContext
const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export { GlobalProvider, useGlobalContext };
