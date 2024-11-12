# Getting Started
## Install dependencies
- Navigate into the directory `some_folder` that you want to clone the repostiory into by the command `cd /path/to/some_folder`.
- Clone this github repository into `some_folder` by the command `git clone https://github.com/noah-yared/chess-app.git`.
- Create a python virtual environment in `some_folder` by the command `python3 -m venv venv`.
- Activate the virtual environment by the command `source venv/bin/activate`.
- Install the python dependencies in `requirements.txt` by running `pip install -r requirements.txt`.
- Install the node dependencies by using a node package manager like `npm`. If you are using `npm`, run `npm install`.

All the necessary dependencies should now be installed and set up.

## Play locally
Play chess with a friend or yourself on the same laptop/computer in a single browser tab (chrome recommended).
### Steps:
- Start up the `flask` server by running `flask --app src/scripts/move_validation run` in your terminal.
- Then, fire up a new terminal instance and start up the `node` server by running `node src/index`.
- Finally, open up a browser tab and navigate to `localhost:3000/local-match` to play.
- To reset the server, hit **CTRL-c** in the terminal instance where the `node` server is running and rerun the command `node src/index`. Then, refresh the browser tab.

## Play online
Simulate online play by playing against a friend or yourself in two different browser tabs (chrome recommended) on the same laptop/computer.
### Steps:
- As in local play, start up the `flask` server by running `flask --app src/scripts/move_validation run` in terminal.
- Likewise, in new terminal instance, run `node src/index` to start `node` server.
- Finally, open up **two** different browser tabs on **same** device and navigate to `localhost:3000/online-match` in both to play.
- To reset the server, hit **CTRL-c** in the terminal instance where the `node` server is running and rerun the command `node src/index`. Then, refresh **both** browser tabs.
