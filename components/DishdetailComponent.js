import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder } from 'react-native';
import { Card, Icon, Input, Rating } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postComment, postFavorite } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => ({
  dishes: state.dishes,
  comments: state.comments,
  favorites: state.favorites,
});

const mapDispatchToProps = dispatch => ({
  postFavorite: dishId => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment)),
});

function RenderDish({ dish, favorite, markFavorite, openCommentForm
}) {

  handleViewRef = ref => this.view = ref;

  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if ( dx < -200 )
        return true;
    else
        return false;
}
// Right to left //

const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
  },
  onPanResponderGrant: () => {
    this.view.rubberBand(1000)
      .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},

  onPanResponderEnd: (e, gestureState) => {
      console.log("pan responder end", gestureState);

      if (recognizeDrag(gestureState))
          Alert.alert(
              'Add Favorite',
              'Are you sure you wish to add ' + dish.name + ' to favorite?',
              [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'OK', onPress: () => favorite ? console.log('Already favorited') : markFavorite()},
              ],
              { cancelable: false }
          );

      return true;
  }
})

if (dish != null) {
    return(
      <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
      ref={this.handleViewRef}
      {...panResponder.panHandlers}>
            <Card
            featuredTitle={dish.name}
            image={{uri: baseUrl + dish.image}}>
          <Text style={{ margin: 10 }}>
            {dish.description}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Icon
              raised
              reverse
              name={favorite ? 'heart' : 'heart-o'}
              type="font-awesome"
              color="#f50"
              onPress={() => favorite ? console.log('Already favorited') : markFavorite()}
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#512DA8"
              onPress={() => openCommentForm()}
            />
          </View>
        </Card>
        </Animatable.View>
    );
  }
  return (<View />);
}

function RenderComments({ comments }) {
  const renderCommentItem = ({ item, index }) => (
    <View key={index} style={{ margin: 10 }}>
      <Text style={{ fontSize: 14 }}>{item.comment}</Text>
      <Text style={{ fontSize: 12 }}>{`${item.rating} Stars`}</Text>
      <Text style={{ fontSize: 12 }}>{`--${item.author}, ${item.date}`}</Text>
    </View>
  );

    return (
       <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>  
          <Card title="Comments">
            <FlatList
              data={comments}
              renderItem={renderCommentItem}
              keyExtractor={item => item.id.toString()}
            />
          </Card>
        </Animatable.View>
    );
  
}

const styles = StyleSheet.create({
  formRow: {
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    margin: 20,
  },

  formLabel: {
    fontSize: 18,
    flex: 2,
  },

  formItem: {
    flex: 1,
  },

  modal: {
    justifyContent: 'space-between',
    margin: 20,
    flex: 1
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#512DA8',
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    margin: 10,
  },
});

class Dishdetail extends Component {
  static navigationOptions = {
    title: 'Dish Details',
  };

  static defaultState() {
    return ({
      rating: 3,
      author: '',
      comment: '',
      showCommentForm: false,
    });
  }

  constructor(props) {
    super(props);
    this.state = Dishdetail.defaultState();
  }

  setRating(rating) {
    this.setState({ rating });
  }

  setAuthor(author) {
    this.setState({ author });
  }

  setComment(comment) {
    this.setState({ comment });
  }

  markFavorite(dishId) {
    const { postFavorite } = this.props;
    postFavorite(dishId);
  }

  resetCommentForm() {
    this.setState(Dishdetail.defaultState());
  }

  handleComment(dishId) {
    const { postComment } = this.props;
    const { author, comment, rating } = this.state;
    postComment(dishId, rating, author, comment);
    this.resetCommentForm();
  }

  openCommentForm() {
    this.setState({ showCommentForm: true });
  }

  render() {
    const { comments, dishes, favorites, navigation } = this.props;
    const { showCommentForm } = this.state;
    const dishId = navigation.getParam('dishId', '');

    return (
      <ScrollView>
        <RenderDish
          dish={dishes.dishes[+dishId]}
          favorite={favorites.some(el => el === dishId)}
          markFavorite={() => this.markFavorite(dishId)}
          openCommentForm={() => this.openCommentForm()}
        />
        <Modal 
          animationType="slide"
          transparent={false}
          visible={showCommentForm}
          onDismiss={() => this.resetCommentForm()}
          onRequestClose={() => this.resetCommentForm()}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Your Comment</Text>
            <Rating
              minValue={1}
              startingValue={3}
              fractions={0}
              showRating
              onFinishRating={rating => this.setRating(rating)}
            />
            <Input
              placeholder=" Author"
              leftIcon={(
                <Icon
                  name="user"
                  type="font-awesome"
                />
              )}
              onChangeText={author => this.setAuthor(author)}
            />
            <Input
              placeholder=" Comment"
              leftIcon={(
                <Icon
                  name="comment"
                  type="font-awesome"
                />
              )}
              onChangeText={comment => this.setComment(comment)}
            />
            <Button
              onPress={() => this.handleComment(dishId)}
              color="#512DA8"
              title="SUBMIT"
            />
            <Button
              onPress={() => this.resetCommentForm()}
              color="#6c757d"
              title="CANCEL"
            />
          </View>
        </Modal>
        <RenderComments comments={comments.comments.filter(comment => comment.dishId === dishId)}
        />
      </ScrollView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);