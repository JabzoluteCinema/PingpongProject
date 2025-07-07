# Simple Pong Game (HTML5/JS)

A classic Pong game built with HTML, CSS, and JavaScript. Play against a basic AI with three difficulty settings. The left paddle is controlled by your mouse, while the right paddle is controlled by the computer.

![Screenshot](https://user-images.githubusercontent.com/placeholder/pong-screenshot.png)

## Features

- **Mouse Paddle**: Move your mouse vertically to control the left (blue) paddle.
- **AI Paddle**: The right (red) paddle is controlled by a computer opponent with adjustable skill.
- **Difficulty Selection**: Choose between Easy, Medium, and Hard before starting the match.
- **Bouncing Ball & Collision**: Realistic ball movement and collision with walls and paddles.
- **Hit Counter**: Displays how many times the ball has been hit in play, and the scores.
- **Victory & Defeat Screens**: Win by scoring 3 points before the AI, or see a defeat screen if the AI wins.
- **No Dependencies**: Pure HTML, CSS, and JavaScript.

## How to Play

1. **Open `index.html` in your browser.**
2. Select your desired difficulty (Easy, Medium, Hard).
3. Move your mouse vertically over the canvas to control your paddle.
4. The goal is to reach 3 points before the AI does!
5. If you win or lose, click "Play Again" to start a new match.

## Project Structure

```
.
├── index.html
├── style.css
├── game.js
└── README.md
```

## Customization

- Adjust paddle or ball sizes in `game.js` easily.
- Change the `WIN_SCORE` variable for longer or shorter matches.
- Tweak AI parameters in the `DIFFICULTIES` object for more challenge or fun.

## License

This project is open source and free to use for educational and personal purposes.

---

Enjoy playing Pong!
