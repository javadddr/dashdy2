// src/hooks/useSubscriptions.js
import React, { useState, useEffect } from 'react';

// Custom hook to fetch and provide subscriptions
const Strip = () => {
  const [subscriptions, setSubscriptions] = useState([]); // Initialize state as an empty array
  const [subscriptionsreal, setSubscriptionsreal] = useState([]); // Initialize state as an empty array
  const [invoices, setInvoices] = useState([]); // New state for invoices
  const [transactions, setTransactions] = useState([]); // New state for transactions
  const [allsubs, setAllsubs] = useState([]);
  const [upcomingin, setUpcomingin] = useState([]);
  // console.log('subscriptions:', subscriptions);
  // console.log('subscriptionsreal:', subscriptionsreal);
  // console.log('invoices:', invoices);
  // console.log('transactions:', transactions);
  // console.log('allsubs:', allsubs);
  
 useEffect(() => {
    const fetchSubscriptions = async () => {
      let allSubscriptions = []; // To store all subscriptions
      let hasMore = true; // To track if there are more pages
      let startingAfter = null; // To track the last subscription ID for pagination

      try {
        while (hasMore) {
          const url = new URL('https://api.stripe.com/v1/customers?limit=100');
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

        setSubscriptions(allSubscriptions); // Save all subscriptions to state
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    fetchSubscriptions();
  }, []); // Run once when the component mounts

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

  useEffect(() => {
    const fetchInvoices = async () => {
      let allInvoices = []; // To store all invoices
      let hasMore = true; // To track if there are more pages
      let startingAfter = null; // To track the last invoice ID for pagination

      try {
        while (hasMore) {
          const url = new URL('https://api.stripe.com/v1/invoices');
          if (startingAfter) {
            url.searchParams.append('starting_after', startingAfter);
          }

          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`, // Use Vite's meta.env for secret key
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch invoices');
          }

          const data = await response.json();
          allInvoices = [...allInvoices, ...data.data]; // Append the fetched data to the array
          hasMore = data.has_more; // Update hasMore based on the response
          if (hasMore) {
            startingAfter = data.data[data.data.length - 1].id; // Set the last invoice ID for the next page
          }
        }

        setInvoices(allInvoices); // Save all invoices to state
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []); // Run once when the component mounts

  useEffect(() => {
    const fetchTransactions = async () => {
      let allTransactions = []; // To store all transactions
      let hasMore = true; // To track if there are more pages
      let startingAfter = null; // To track the last transaction ID for pagination
  
      try {
        while (hasMore) {
          const url = new URL('https://api.stripe.com/v1/charges');
          if (startingAfter) {
            url.searchParams.append('starting_after', startingAfter);
          }
  
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`, // Use Vite's meta.env for secret key
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }
  
          const data = await response.json();
          allTransactions = [...allTransactions, ...data.data]; // Append the fetched data to the array
          hasMore = data.has_more; // Update hasMore based on the response
          if (hasMore) {
            startingAfter = data.data[data.data.length - 1].id; // Set the last transaction ID for the next page
          }
        }
  
        setTransactions(allTransactions); // Save all transactions to state
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
  
    fetchTransactions();
  }, []); // Run once when the component mounts
  
  useEffect(() => {
    const fetchAllSubscriptions = async () => {
      let allSubscriptions = []; // To store all subscriptions
      let hasMore = true; // To track if there are more pages
      let startingAfter = null; // To track the last subscription ID for pagination
  
      try {
        while (hasMore) {
          const url = new URL('https://api.stripe.com/v1/subscriptions?status=all');
          if (startingAfter) {
            url.searchParams.append('starting_after', startingAfter);
          }
  
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`, // Use Vite's meta.env for secret key
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch subscriptions with status=all');
          }
  
          const data = await response.json();
          allSubscriptions = [...allSubscriptions, ...data.data]; // Append the fetched data to the array
          hasMore = data.has_more; // Update hasMore based on the response
          if (hasMore) {
            startingAfter = data.data[data.data.length - 1].id; // Set the last subscription ID for the next page
          }
        }
  
        setAllsubs(allSubscriptions); // Save all subscriptions with status=all to state
      } catch (error) {
        console.error('Error fetching subscriptions with status=all:', error);
      }
    };
  
    fetchAllSubscriptions();
  }, []); // Run once when the component mounts
  return { subscriptions, subscriptionsreal, invoices, transactions,allsubs };

};

export { Strip };
