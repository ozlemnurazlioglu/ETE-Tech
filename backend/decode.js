const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZXV6YWdxdnhyaWlodGtscWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjkxNTIsImV4cCI6MjA5Njg0NTE1Mn0.wwCvDQ3-0klzZQsoVZow3Fld9cOwZHIcljt51g4JDF8';
const payload = jwt.split('.')[1];
const decoded = Buffer.from(payload, 'base64').toString('utf-8');
console.log('DECODED JWT:', decoded);
