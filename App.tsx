import React, { Component } from "react";
import { StyleSheet, View, StatusBar, ActivityIndicator } from "react-native";
import db from "db/User";
import {
  dropUserGoal,
  dropSupportLink,
  dropFrequentlyAskedQuestions,
  dropCourtDateReminder,
} from "db/DropScripts";
import styles from "styles/Styles";
import SplashScreen from "components/SplashScreen";
import UserSetupSwiper from "components/UserSetupSwiper";
import HomeDashboard from "components/HomeDashboard";
import CustomOnboarding from "components/CustomOnboarding";

// font-awesome icons = https://fontawesome.com/v4.7.0/icons/
// 06-06-2020: https://www.typescriptlang.org/docs/handbook/basic-types.html

export default class App extends Component {
  /****************************************************************************************************************************************************/
  // State Hooks: https://reactjs.org/docs/hooks-state.html
  state = {
    userLanding: <></>, // by default, we send the user to the home dashboard.
  };
  //"componentDidMount" will execute automatically before render()
  componentDidMount() {
    this.checkUser();
  }

  //This function is only invoked when a user has successfully confirmed their details are all correct by pressing the "Yes" button upon confirmation.
  completeUserSetUp = () => {
    db.updateUserSetUp(); // We set the 'userSetUp' boolean in our table 'user' to true;
    this.checkUser(); // We now then check the 'userSetUp' value if it's true or false then render the proper components.
  };

  completeUserOnboarding = () => {
    db.updateUserOnboarding(1);
    this.checkUser();
  };

  //This will delete the whole "user" table. That means you will be able to mock up the registration process again and again
  deleteAccountHandler = async () => {
    await dropUserGoal();
    await dropSupportLink();
    await dropFrequentlyAskedQuestions();
    await dropCourtDateReminder();
    await db.dropLearningModules();
    await db.dropUser(); //delete user table.
    await db.dropCondtion();
    await db.setUpUserTable(); //set-up user table.
    await db.setUpConditionTable();
    this.checkUser(); //check which component should the user see.
  };

  redoTutorial = () => {
    db.updateUserOnboarding(0);
    this.checkUser();
  };

  async checkUser() {
    this.setState({
      userLanding: <View style={[styles.container,styles.bgPurple1]}><ActivityIndicator/></View> //prettier-ignore
    });

    await db.setUpUserTable();
    await db.setUpConditionTable();

    let isUserAlreadySet = await db.checkUserSetUp();
    let isUserCompleteOnboarding = await db.checkUserOnboarding();

    if (isUserAlreadySet && isUserCompleteOnboarding) {
      this.setState({
        userLanding: [<SplashScreen key={0}/>,<HomeDashboard key={1} redoTutorial={this.redoTutorial} deleteAccountHandler={this.deleteAccountHandler} />] //prettier-ignore
      });
    } else if (isUserAlreadySet && !isUserCompleteOnboarding) {
      this.setState({
        userLanding: [<SplashScreen key={0}/>,<CustomOnboarding key={1} completeUserOnboarding={this.completeUserOnboarding} />] //prettier-ignore
      });
    } else {
      this.setState({
        userLanding: [<SplashScreen key={0}/>,<UserSetupSwiper key={1} action={this.completeUserSetUp} />] // prettier-ignore
      });
    }
  }

  /****************************************************************************************************************************************************/
  // The rendered component
  render() {
    return (
      <View style={styles.container}>
        {/* HELLO IM A NEW CHANGE  hellow*/}
        <SplashScreen />
        <StatusBar hidden />
        {this.state.userLanding}
      </View>
    );
  }
}
