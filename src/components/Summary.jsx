import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Summary = () => {
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalDonation, setTotalDonation] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0); // New state for remaining amount
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let calculatedTotalExpense = 0;
      let calculatedTotalDonation = 0;
      const currentYear = new Date().getFullYear().toString(); // Will be "2025"
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      // --- 1. Get Total Expense from Firebase ---
      try {
        const expenseDocRef = doc(db, "expenses", "hPTZ3pkljqT2yuiKLDA3");
        const expenseDocSnap = await getDoc(expenseDocRef);

        if (expenseDocSnap.exists()) {
          const expenseData = expenseDocSnap.data();
          // *** IMPORTANT: Replace 'amount' with the actual field name for your expense value in Firestore if it's different. ***
          calculatedTotalExpense += Number(expenseData.amount) || 0;
        } else {
          console.log("No Firebase expense document found at expenses/hPTZ3pkljqT2yuiKLDA3!");
        }
      } catch (e) {
        console.error("Error fetching Firebase expense data: ", e);
        setError("Failed to load Firebase expenses.");
      }

      // --- 2. Get Total Expense from Session Storage ---
      try {
        const sessionExpensesString = sessionStorage.getItem("expenses");
        if (sessionExpensesString) {
          const sessionExpenses = JSON.parse(sessionExpensesString);

          if (sessionExpenses[currentYear]) {
            months.forEach(month => {
              if (sessionExpenses[currentYear][month] && Array.isArray(sessionExpenses[currentYear][month])) {
                sessionExpenses[currentYear][month].forEach(expenseItem => {
                  if (expenseItem.amount) {
                    calculatedTotalExpense += Number(expenseItem.amount);
                  }
                });
              }
            });
          }
        } else {
          console.log("No 'expenses' data found in session storage.");
        }
      } catch (e) {
        console.error("Error parsing or calculating session storage expenses: ", e);
        setError(prev => (prev ? prev + " Failed to load session expenses." : "Failed to load session expenses."));
      }
      setTotalExpense(calculatedTotalExpense); // Update state after all expense calculations

      // --- 3. Get Total Donation from Session Storage ---
      try {
        const allMembersString = sessionStorage.getItem("allMembers");
        if (allMembersString) {
          const allMembers = JSON.parse(allMembersString);

          allMembers.forEach(member => {
            if (member.donation && member.donation[currentYear]) {
              months.forEach(month => {
                if (member.donation[currentYear][month]) {
                  calculatedTotalDonation += Number(member.donation[currentYear][month]);
                }
              });
            }
          });
        } else {
          console.log("No 'allMembers' data found in session storage.");
        }
      } catch (e) {
        console.error("Error parsing or calculating donation data from session storage: ", e);
        setError(prev => (prev ? prev + " Failed to load donations." : "Failed to load donations."));
      } finally {
        setTotalDonation(calculatedTotalDonation); // Update state after donation calculation

        // --- Calculate Remaining Amount ---
        setRemainingAmount(calculatedTotalDonation - calculatedTotalExpense);

        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once after the initial render

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.2em' }}>Loading finance data...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px', border: '1px solid red' }}>Error: {error}</div>;
  }

  const remainingAmountColor = remainingAmount >= 0 ? '#5cb85c' : '#d9534f'; // Green for positive, red for negative

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Financial Overview</h1>

      <div style={{ marginBottom: '15px', padding: '10px 15px', background: '#f9f9f9', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#555' }}>Total Donations ({new Date().getFullYear()}):</strong>
        <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#5cb85c' }}>₹{totalDonation.toFixed(2)}</span>
      </div>

      <div style={{ marginBottom: '15px', padding: '10px 15px', background: '#f9f9f9', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#555' }}>Total Expenses ({new Date().getFullYear()}):</strong>
        <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#d9534f' }}>₹{totalExpense.toFixed(2)}</span>
      </div>

      <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

      <div style={{ padding: '10px 15px', background: '#eaf7ff', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#337ab7' }}>Remaining Amount:</strong>
        <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: remainingAmountColor }}>₹{remainingAmount.toFixed(2)}</span>
      </div>

      <p style={{ fontSize: '0.9em', color: '#888', textAlign: 'center', marginTop: '30px' }}>
        Data fetched as of {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default Summary;