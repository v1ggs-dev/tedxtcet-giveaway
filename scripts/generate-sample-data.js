const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Muhammad', 'Sai', 'Arnav', 'Ayaan',
  'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Advik', 'Pranav', 'Advaith', 'Aaryan', 'Dhruv', 'Kabir',
  'Rudra', 'Ananya', 'Diya', 'Gauri', 'Isha', 'Kavya', 'Khushi', 'Navya', 'Pooja', 'Pari',
  'Riya', 'Saanvi', 'Tanvi', 'Veda', 'Zoya', 'Sneha', 'Meera', 'Aditi', 'Shruti', 'Anika',
  'Rohit', 'Siddharth', 'Varun', 'Vignesh', 'Rahul', 'Nikhil', 'Kunal', 'Manish', 'Harsh', 'Tushar',
  'Rohan', 'Karan', 'Dev', 'Yash', 'Sanket', 'Prateek', 'Shubham', 'Mayank', 'Akash', 'Gaurav',
  'Tanmay', 'Chirag', 'Samarth', 'Siddhesh', 'Omkar', 'Sahil', 'Prathamesh', 'Chinmay', 'Abhishek', 'Rajat',
  'Aniket', 'Vikas', 'Deepak', 'Saurabh', 'Alok', 'Utkarsh', 'Swapnil', 'Tejas', 'Kaustubh', 'Mandar'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Mehta', 'Shah', 'Deshmukh', 'Joshi', 'Kulkarni', 'Patil', 'Pawar',
  'Shinde', 'Chavan', 'Gupta', 'Singh', 'Kumar', 'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Yadav',
  'Iyer', 'Menon', 'Nair', 'Pillai', 'Rao', 'Reddy', 'Shetty', 'Hegde', 'Kamath', 'Bhat',
  'Banerjee', 'Chatterjee', 'Mukherjee', 'Dutta', 'Ghosh', 'Das', 'Sen', 'Roy', 'Chakraborty', 'Bose',
  'Jain', 'Agarwal', 'Bansal', 'Goel', 'Mittal', 'Singhal', 'Garg', 'Chopra', 'Malhotra', 'Kapoor'
];

const departments = [
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Internet of Things',
  'Organizing Committee',
  'External Guest / Attendee',
];

const participants = [];

for (let i = 1; i <= 528; i++) {
  const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = (fName + ' ' + lName).toUpperCase();
  const email = fName.toLowerCase() + '.' + lName.toLowerCase() + i + '@tcetmumbai.in';
  const phone = '+91 ' + Math.floor(7000000000 + Math.random() * 2999999999);
  const dept = departments[Math.floor(Math.random() * departments.length)];

  participants.push({
    'Participant ID': 'TCET-GIVEAWAY-' + i.toString().padStart(4, '0'),
    'Full Name': fullName,
    'Email Address': email,
    'Phone Number': phone,
    'Department': dept,
    'Registration Status': 'CONFIRMED',
    'Registration Date': new Date(Date.now() - Math.floor(Math.random() * 10 * 86400000)).toISOString().split('T')[0]
  });
}

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Write Excel (.xlsx) file
const worksheet = XLSX.utils.json_to_sheet(participants);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'TEDxTCET_Giveaway');
const xlsxPath = path.join(dataDir, 'sample-participants.xlsx');
XLSX.writeFile(workbook, xlsxPath);

// 2. Write CSV (.csv) file
const csvContent = XLSX.utils.sheet_to_csv(worksheet);
const csvPath = path.join(dataDir, 'sample-participants.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');

// 3. Write direct JSON for database service
const jsonParticipants = participants.map((p, idx) => ({
  id: p['Participant ID'],
  name: p['Full Name'],
  email: p['Email Address'],
  phone: p['Phone Number'],
  department: p['Department'],
  customData: p,
  createdAt: new Date().toISOString()
}));

const jsonPath = path.join(dataDir, 'participants.json');
fs.writeFileSync(jsonPath, JSON.stringify(jsonParticipants, null, 2), 'utf-8');

console.log('Successfully generated ' + participants.length + ' participants:');
console.log('- Excel: ' + xlsxPath);
console.log('- CSV: ' + csvPath);
console.log('- JSON: ' + jsonPath);
