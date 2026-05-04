import mqtt from "mqtt";

let client: any;

export const connectMQTT = (onMessage: (data: any) => void) => {
  client = mqtt.connect("ws://localhost:9001");

  client.on("connect", () => {
    console.log("MQTT Connected");

    // subscribe semua room
    client.subscribe("room/+/status");
  });

  client.on("message", (topic: string, message: any) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("MQTT RECEIVED:", data);

      onMessage(data);
    } catch (e) {
      console.log("Invalid MQTT message");
    }
  });

  client.on("error", (err: any) => {
    console.log("MQTT Error:", err);
  });
};