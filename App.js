import { StatusBar } from "expo-status-bar";
import { useState, useEffect, use } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PLAYER_WIDTH = 90;
const PLAYER_HEIGHT = 90;

const BLOCK_WIDTH = 60;
const BLOCK_HEIGHT = 60;

export default function App() {
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);
  const [blocks, setBlocks] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const playerY = screenHeight - PLAYER_HEIGHT - 20;

  const restart = () => {
    setPlayerX((screenWidth - PLAYER_WIDTH) / 2);
    setBlocks([]);
    setGameOver(false);
  };

  useEffect(() => {
    if (gameOver) return;
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x }) => {
      setPlayerX((prev) => {
        const next = prev - x * 20;
        const min = 0;
        const max = screenWidth - PLAYER_WIDTH;
        return Math.max(min, Math.min(max, next));
      });
    });
    return () => subscription.remove();
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const spawn = setInterval(() => {
      setBlocks((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * (screenWidth - BLOCK_WIDTH),
          y: -BLOCK_HEIGHT,
        },
      ]);
    }, 1200);

    return () => clearInterval(spawn);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const fall = setInterval(() => {
      setBlocks((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + 5 }))
          .filter((b) => b.y < screenHeight + BLOCK_HEIGHT)
      );
    }, 16);

    return () => clearInterval(fall);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    blocks.forEach((block) => {
      const collide =
        playerX < block.x + BLOCK_WIDTH &&
        playerX + PLAYER_WIDTH > block.x &&
        playerY < block.y + BLOCK_HEIGHT &&
        playerY + PLAYER_HEIGHT > block.y;

      if (collide) setGameOver(true);
    });
  }, [blocks, playerX, gameOver]);

  return (
    <ImageBackground
      source={require("./assets/bg.png")}
      style={styles.container}
    >
      <StatusBar style="light" />

      <Image
        source={require("./assets/player.png")}
        style={{
          position: "absolute",
          width: PLAYER_WIDTH,
          height: PLAYER_HEIGHT,
          left: playerX,
          top: playerY,
        }}
      />

      {blocks.map((bl) => (
        <Image
          key={bl.id}
          source={require("./assets/block.png")}
          style={{
            position: "absolute",
            width: BLOCK_WIDTH,
            height: BLOCK_HEIGHT,
            left: bl.x,
            top: bl.y,
          }}
        />
      ))}

      {!gameOver && <Text style={styles.instruction}>Tilt to Dodge!</Text>}

      {gameOver && (
        <>
          <Text style={styles.gameOver}>GAME OVER</Text>
          <TouchableOpacity onPress={restart} style={styles.restartBtn}>
            <Text style={styles.restartText}>RESTART</Text>
          </TouchableOpacity>
        </>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },  
  player: {
    position: "absolute",
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    backgroundColor: "white",
  },
  block: {
    position: "absolute",
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    backgroundColor: "white",
  },
  instruction: {
    color: "#FFFFFF",
    position: "absolute",
    top: 70,
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "600",
    textShadowColor: "rgba(255,255,255,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  gameOver: {
    color: "#FF4C4C",
    fontSize: 40,
    fontWeight: "900",
    position: "absolute",
    top: screenHeight / 2 - 100,
    alignSelf: "center",
    textShadowColor: "rgba(255, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
  },

  restartBtn: {
    position: "absolute",
    top: screenHeight / 2,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    backdropFilter: "blur(8px)",
  },

  restartText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    textShadowColor: "rgba(255,255,255,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },  
});