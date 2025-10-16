# FoodReels - Food Discovery App

A TikTok-style food discovery application that allows users to browse, like, and save short food videos, while food partners can upload their own content.

## Features

### For Regular Users:
- Browse food videos in a TikTok-style vertical feed
- Like and save favorite videos
- Search for specific foods
- Browse by categories
- View food partner profiles

### For Food Partners:
- Upload food videos with descriptions
- Create a profile to showcase their offerings
- Track likes and saves on their content

## Project Structure

```
├── Backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Business logic
│   └── uploads/             # Uploaded videos
├── Frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Routing configuration
│   │   └── styles/          # CSS stylesheets
│   └── vdeos/               # Sample videos
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the Backend directory:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   JWT_SECRET=your_jwt_secret_key
   MONGODB_URL=mongodb://localhost:27017/zomato
   ```

4. Start the server:
   ```
   node server.js
   ```

### Frontend Setup
1. Navigate to the Frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/user/register` - Register a new user
- `POST /api/auth/user/login` - Login as a user
- `POST /api/auth/food-partner/register` - Register as a food partner
- `POST /api/auth/food-partner/login` - Login as a food partner

### Food Content
- `POST /api/food` - Upload a new food video (requires food partner authentication)
- `GET /api/food` - Get all food videos
- `POST /api/food/like` - Like/unlike a food video (requires user authentication)
- `POST /api/food/save` - Save/unsave a food video (requires user authentication)

## How to Use

1. Start both the backend and frontend servers
2. Open your browser and navigate to `http://localhost:5173`
3. Choose to register as either a regular user or food partner
4. Browse food videos in the home feed
5. Like and save your favorite videos
6. Food partners can upload their own content through the "Create Food" page

## Sample Data

The application comes with sample food videos and data to demonstrate the functionality:
- Spicy Italian Pasta
- Gourmet Burger
- Fresh Sushi Rolls
- Chocolate Lava Cake

Each with realistic like and save counts to simulate an active community.

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads

### Frontend
- React
- React Router
- Axios for API calls
- CSS3 for styling

## Future Enhancements

- Add comments functionality
- Implement user following system
- Add push notifications
- Integrate with payment systems for food ordering
- Add video processing for different resolutions
- Implement caching for better performance