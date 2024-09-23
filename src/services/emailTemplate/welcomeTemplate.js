export default function welcomeMessage(userName = "Raj") {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome Email</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
              font-weight: 600;
            }
  
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
  
            .logo {
              margin-bottom: 20px;
            }
  
            .logo img {
              width: 50px;
              /* Adjust logo size */
            }
  
            h1 {
              font-size: 22px;
              color: #464646;
            }
  
            h2 {
              font-size: 20px;
              color: #1100ff;
            }
  
            p {
              font-size: 16px;
              color: #666666;
              line-height: 1.5;
            }
  
            a {
              color: #007bff;
              text-decoration: none;
            }
  
            .footer {
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Logo Section -->
            <div class="logo">
              <img
                src="https://res.cloudinary.com/dqunbolsu/image/upload/v1726842181/ChaiOrCode/images/khcifqv9wcgjgna3oqop.png"
                alt="Logo"
              />
            </div>
  
            <!-- Email Heading -->
            <h1>Welcome!</h1>
            <h2>${userName}</h2>
  
            <!-- Email Body -->
            <p>Thank you for creating a new account.</p>
            <p>
              If you need assistance, our support team is here to help. Please do
              not hesitate to <a href="https://yourwebsite.com/contact">contact us</a>
              if you have any questions or concerns.
            </p>
  
            <!-- Footer Section -->
            <p class="footer">Thanks again!</p>
          </div>
        </body>
      </html>
    `;
  }
  