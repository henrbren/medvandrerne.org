import React, { useState, useEffect } from 'react';
import { View, Text , StyleSheet} from 'react-native';
import { localize } from "@translations/localize";

const CountDown = ({ targetDate, name }) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = targetDate - now;
    
    return difference > 0 ? difference : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const weeks = Math.floor(timeLeft / (1000 * 60 * 60 * 24 * 7));
  const days = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <View style={styles.view} >
      <Text style={styles.text}>{`${weeks} ${localize("main.dates.weeks")}, ${days} ${localize("main.dates.days")}, ${seconds} ${localize("main.dates.seconds")}`}</Text>
      <Text style={styles.smallText}>{`${localize("main.screens.dogDetail.countdown.to")} ${name} ${localize("main.screens.dogDetail.countdown.arrival")}`}! </Text>
    </View>
  );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      smallText:{
        fontSize: 12,
        marginTop: 5,
      },
      view:{
        justifyContent: 'center',

      }
  });

export default CountDown;
