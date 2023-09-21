import {StyleSheet} from 'react-native';

const Styles = StyleSheet.create({
  create_todo_container: {
    flexDirection: 'row',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#208AEC',
  }, 
  flex_between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  create_todo_input: {
    flex: 1,
    height: 38,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 14,
  },
  create_todo_button: {
    width: '100%',
    marginTop: 10,
    padding: 10,
    height: 60,
  },

  create_todo_input:{
    width: '100%',
    flex: 1,
  },
  create_todo_input_desc:{
    width: '100%',
    flex: 1,
  },
  wrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  login_container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  login_header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 50,
    backgroundColor: '#208AEC',
  },
  login_header_logo: {
    width: 220,
    resizeMode: 'contain',
  },
  login_header_text: {
    marginTop: 15,
    color: '#f0f0f0',
    fontSize: 16,
  },
  login_header_text_bold: {
    color: '#fff',
    fontWeight: 'bold',
  },
  login_wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    marginTop: -10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 280,
  },
  form_input: {
    height: 44,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#EDF0F7',
    borderRadius: 50,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: '#FF7100',
    borderRadius: 50,
  },
  button_label: {
    color: '#fff',
    fontSize: 15,
  },
  login_social: {
    width: '100%',
    maxWidth: 280,
    marginTop: 20,
  },
  login_social_separator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  login_social_separator_line: {
    flex: 1,
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  login_social_separator_text: {
    marginHorizontal: 10,
    color: '#808080',
    fontSize: 16,
  },
  login_title:{
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF7100',
    textAlign: 'center',
    marginTop: 20,
  },
  login_social_buttons: {
  
    marginTop: 20,
  },
  login_social_button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    borderRadius: 60,
  },
  login_social_icon: {
    fontSize: 24,
    resizeMode: 'contain',
  },
  login_social_facebook: {
    backgroundColor: '#4267B2',
    borderColor: '#4267B2',
  },
  login_footer_text: {
    flexDirection: 'row',
    alignItems: 'center',
    color: '#808080',
    fontSize: 15,
  },
  login_footer_link: {
    color: '#208AEC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  todo_item:{
    backgroundColor: '#fff',
    borderRadius: 5,
    padding:10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    
    elevation: 3,
  },
  list_arrow:{
    position: 'absolute',
    right: 15,
    top: 15,

  },
  list_text_header:{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7100',
  },
  list_text:{
    fontSize: 14,
    color: '#333',
    paddingTop: 5,
  },
  todo_item_container:{
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  selectImageText:{
    alignSelf: 'center',
    marginBottom: 10,
    color: '#333'
  },
  wrapper:{
    backgroundColor:"#fff",
    padding: 10,
    marginRight: 10,
    marginLeft: 10, 
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 5,
  },
});

export default Styles;