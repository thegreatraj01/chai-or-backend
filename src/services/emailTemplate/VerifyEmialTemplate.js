export default function verifyEmail(username = 'Raj', otp = "1234") {
    const otpDigits = otp.split('');

    const otpElements = otpDigits.map((digit) => `<p style="margin-left: 8px;" class="otpbox">${digit}</p>`).join('');

    
    return `<html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            font-family: 'Nunito', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f3f4f6;
        }

        .container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 500px;
            width: 100%;
            margin: 20px;
        }

        .header {
            background-color: #365cce;
            color: white;
            padding: 20px;
            text-align: center;
        }

        .header svg {
            margin: 10px 0;
        }

        .main {
            padding: 20px;
        }

        .main h4 {
            margin: 0;
            font-size: 18px;
            color: #374151;
        }

        .main p {
            color: #4b5563;
            line-height: 1.5;
            margin-top: 10px;
        }

        .otp-container {
            display: flex;
            margin-top: 20px;
            gap : 10px;
            font-size: 18px;
            font-weight: 700;
        }

        .button {
            display: block;
            margin: 20px auto 0;
            padding: 10px 20px;
            background-color: #f97316;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .button:hover {
            background-color: #e85e00;
        }

        footer {
            background-color: #d1d5db;
            text-align: center;
            padding: 20px;
            margin-top: 20px;
        }

        .footertext {
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Verify your E-mail Address</h1>
        </div>

        <div class="main">
            <h4>Hello ${username},</h4>
            <p>Please use the following One Time Password (OTP):</p>
            <div class="otp-container">
                ${otpElements}
            </div>
            <p>This passcode will only be valid for the next <span style="font-weight: bold;">10 minutes</span>. If the passcode does not work, you can use this login verification link:</p>
            <button class="button">Verify email</button>
        </div>
        <footer>
            <p class="footertext">If you have any questions, feel free to <a href="#">contact us</a> at <a href="mailto:support@chaiorcode.com">support@chaiorcode.com</a></p>
        </footer>
    </div>
</body>
</html>`;
}
