import moment from 'moment'

export default class App extends Component {
  _askForCalendarPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.CALENDAR)
    return response.status === 'granted'
  }

  _askForReminderPermissions = async () => {
    if (Platform.OS === 'android') {
      return true
    }

    const response = await Permissions.askAsync(Permissions.REMINDERS)
    return response.status === 'granted'
  }

  _findCalendars = async () => {
    const calendarGranted = await this._askForCalendarPermissions()
    const reminderGranted = await this._askForReminderPermissions()
    let calendars = []

    if (calendarGranted && reminderGranted) {
      calendars = await Calendar.getCalendarsAsync()
    }

    return calendars
  }

  _createNewCalendar = async (calendars) => {
    const newCalendar = {
      title: 'test',
      entityType: Calendar.EntityTypes.EVENT,
      color: '#2196F3',
      sourceId:
        Platform.OS === 'ios'
        ? calendars.find(cal => cal.source && cal.source.name === 'Default').source.id
        : undefined,
      source:
        Platform.OS === 'android'
        ? {
          name: calendars.find(cal => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER).source.name,
          isLocalAccount: true
        }
        : undefined,
      name: 'test',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
      ownerAccount:
        Platform.OS === 'android'
        ? calendars.find(cal => cal.accessLevel == Calendar.CalendarAccessLevel.OWNER).ownerAccount
        : undefined
    }

    let calendarId = null

    try {
      calendarId = await Calendar.createCalendarAsync(newCalendar)
    } catch (e) {
      Alert.alert('Le calendrier n\'a pas été sauvegardé', e.message)
    }

    return calendarId
  }

  _addEventsToCalendar = async (calendarId) => {
    const event = {
      title: 'my cool event',
      location: 'Route François-Peyrot 30, 1218 Le Grand-Saconnex',
      startDate: moment().toDate(),
      endDate: moment().add(1, 'hours').toDate(),
      timeZone: 'Europe/Zurich'
    }

    try {
      await Calendar.createEventAsync(calendarId, event)
    } catch (e) {
      Alert.alert('Une erreur est survenue lors de l\'ajout de vos indisponiblité à votre calendrier')
    }
  }

  synchronizeCalendar = async () => {
    let calendars = await this._findCalendars()
    const calendarId = await this._createNewCalendar(calendars)
    try {
      await this._addEventsToCalendar(calendarId)
      Alert.alert('Le calendrier a été synchronisé')
    } catch (e) {
      Alert.alert('Une erreur est survenue lors de l\'ajout des évènements au calendrier', e.message)
    }
  }
  
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.synchronizeCalendar}>
          <Text>Synchronize</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});