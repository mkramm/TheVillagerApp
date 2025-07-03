import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#34495e',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  hostContent: {
      flex: 1,
      justifyContent: 'center', // Zentriert das Spiel
      padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#bdc3c7',
    marginBottom: 30,
  },
  list: {
    width: '100%',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButtonText: {
      color: '#d0d0d0',
  },
  minigameContainer: {
    flex: 0.8, // Nimmt 80% des verfügbaren Platzes ein
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 15,
  },
  minigameText: {
    fontSize: 22,
    color: '#ecf0f1',
    textAlign: 'center',
  },
    minigameSubText: {
        fontSize: 16,
        color: '#bdc3c7',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default styles;