
const applyMiddleware = require("./src/middlewares");
const connectDB = require("./src/db/connectDB");
const { PORT } = require("./src/config/defaults");
const { app } = require("./src/Socket");
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

app.get("/", (req, res) => {
  res.send("server is running....");
});
app.use(express.static('uploads'))

app.all("*", (req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on the server`);
  error.status = 404;
  next(error);
});

// error handling middleware
app.use(globalErrorHandler);

const main = async () => {
  await connectDB()
  app.listen(port, '192.168.10.6', () => {
    console.log(`Server is running on port ${port}`);
  });
}
main()