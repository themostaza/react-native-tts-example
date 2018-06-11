/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  Slider
} from "react-native";
import Tts from "react-native-tts";

type Props = {};
export default class App extends Component<Props> {
  state = {
    voices: [],
    ttsStatus: null,
    selectedVoice: null,
    speechRate: 0.5,
    speechPitch: 1,
    text: "This is an example text"
  };

  constructor(props) {
    super(props);
    Tts.addEventListener("tts-start", event =>
      this.setState({ ttsStatus: "started" })
    );
    Tts.addEventListener("tts-finish", event =>
      this.setState({ ttsStatus: "finished" })
    );
    Tts.addEventListener("tts-cancel", event =>
      this.setState({ ttsStatus: "cancelled" })
    );
    Tts.voices().then(voices => {
      const availableVoices = voices
        .filter(v => !v.networkConnectionRequired && !v.notInstalled)
        .map(v => {
          return { id: v.id, name: v.name, language: v.language };
        });
      this.setState({ voices: availableVoices });
    });
  }

  readText = async () => {
    if (!this.state.ttsStatus) {
      await Tts.getInitStatus();
      this.setState({ ttsStatus: "initialized" });
    }
    await Tts.stop();
    await Tts.speak(this.state.text);
  };

  setSpeechRate = async rate => {
    this.setState({ speechRate: rate });
    await Tts.setDefaultRate(rate);
  };

  setSpeechPitch = async rate => {
    this.setState({ speechPitch: rate });
    await Tts.setDefaultPitch(rate);
  };

  onVoicePress = async voice => {
    await Tts.setDefaultLanguage(voice.language);
    await Tts.setDefaultVoice(voice.id);
    this.setState({ selectedVoice: voice.id });
  };

  renderVoiceItem = ({ item }) => {
    return (
      <Button
        title={`${item.language} - ${item.name || item.id}`}
        color={this.state.selectedVoice === item.id ? undefined : "#969696"}
        onPress={() => this.onVoicePress(item)}
      />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>TTS Example</Text>
        <Text style={styles.instructions}>{`Status: ${this.state.ttsStatus ||
          ""}`}</Text>
        <Text style={styles.instructions}>{`Selected Voice: ${this.state
          .selectedVoice || ""}`}</Text>
        <Text
          style={styles.instructions}
        >{`Speed: ${this.state.speechRate.toFixed(2)}`}</Text>
        <Slider
          style={{ width: 300 }}
          minimumValue={0.01}
          maximumValue={0.99}
          value={this.state.speechRate}
          onSlidingComplete={this.setSpeechRate}
        />
        <Text
          style={styles.instructions}
        >{`Pitch: ${this.state.speechPitch.toFixed(2)}`}</Text>
        <Slider
          style={{ width: 300 }}
          minimumValue={0.5}
          maximumValue={2}
          value={this.state.speechPitch}
          onSlidingComplete={this.setSpeechPitch}
        />
        <Button title={`Read`} onPress={this.readText} />
        <FlatList
          keyExtractor={item => item.id}
          renderItem={this.renderVoiceItem}
          extraData={this.state.selectedVoice}
          data={this.state.voices}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
