const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;
  
    // Validate input
    if (!name || !email || !password) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }
  
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }
  
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });
  
    // Send token response
    sendTokenResponse(user, 201, res); // Use 201 for resource creation
  });

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    try {
      // Create token
      const token = user.getSignedJwtToken();
  
      const options = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
  
      if (process.env.NODE_ENV === 'production') {
        options.secure = true;
      }
  
      res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
    } catch (err) {
      console.error('Token generation error:', err);
      res.status(500).json({
        success: false,
        message: 'Error generating token',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  };