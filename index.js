
const applyMiddleware = require("./src/middlewares");
const connectDB = require("./src/db/connectDB");
const { PORT } = require("./src/config/defaults");
const express = require("express")
const port = PORT || 5000;
const AuthRoute = require("./src/routes/AuthenticationRoute");
const globalErrorHandler = require("./src/utils/globalErrorHandler");
const DoctorsRoute = require("./src/routes/DoctorsRoute");
const UsersRoute = require("./src/routes/UsersRoutes");
const CategoryRoutes = require("./src/routes/CategoryRoutes");
const BannerRoute = require("./src/routes/BannerRoute");
const FaqRoutes = require("./src/routes/FaqRoutes");
const SettingsRoutes = require("./src/routes/SettingsRoutes");
const FavoriteDoctorRoutes = require("./src/routes/FavoriteDoctorRoutes");
const ReviewRoutes = require("./src/routes/ReviewRoutes");
const AppointmentRoute = require("./src/routes/AppointmentRoute");
const NotificationRoutes = require("./src/routes/NotificationRoutes");
const PaymentRoutes = require("./src/routes/PaymentRoutes");
const OverViewRoutes = require("./src/routes/OverView");
const socketIO = require("socket.io");
const socketHelper = require("./src/Socket");
const app = express();
applyMiddleware(app);

//routes
app.use('/auth', AuthRoute)
app.use('/doctors', DoctorsRoute)
app.use('/users', UsersRoute)
app.use('/category', CategoryRoutes)
app.use('/banner', BannerRoute)
app.use('/faq', FaqRoutes)
app.use('/settings', SettingsRoutes)
app.use('/favorite', FavoriteDoctorRoutes)
app.use('/review', ReviewRoutes)
app.use('/appointment', AppointmentRoute)
app.use('/notification', NotificationRoutes)
app.use('/payment', PaymentRoutes)
app.use('/overview', OverViewRoutes)

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Server Status</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
      <div class="bg-white p-8 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Medical Status</h1>
        <p class="text-gray-600">The server is running....</p>
      </div>
    </body>
    </html>
  `);
});
app.use(express.static('uploads'))

app.all("*", (req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on the server`);
  error.status = 404;
  next(error);
});

// error handling middleware
app.use(globalErrorHandler);

let server;
const main = async () => {
  await connectDB()
  server = app.listen(port, '103.161.9.133', () => {
    console.log(`Server is running on port ${port}`);
  });

  //socket
  const io = socketIO(server,{
    cors:{
      origin: "*"
    }}
  )

  socketHelper(io);
  global.io = io;
}
main()
