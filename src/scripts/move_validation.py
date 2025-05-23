from flask import Flask, jsonify, request
from flask_cors import CORS
import scripts.chess as chess


app = Flask(__name__)
CORS(app)


@app.route("/api/validate-move", methods=["POST"])
def check_move():
    # EXAMPLE JSON:
    # {
    # 	"board" : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ -", # FEN notation
    # 	"move" : [[6, 4], [4,4]]  # Move pawn to e5
    # }
    data = request.get_json()
    move = tuple(data["move"][0]), tuple(data["move"][1])
    game = chess.game(parse_FEN(data["board"]))
    is_valid_move = game.make_move(move)
    return jsonify({
        "fen": game.fen,
        "valid": is_valid_move,
        "checkmate": game.checkmate,
        "stalemate": game.stalemate,
        "check": game.check,
        "castled": game.castled,
        "enpassant": game.enpassant,
        "promotion": game.promotion,
        "oppKing": game.white_king if game.turn == 'w' else game.black_king,
        "allyKing": game.white_king if game.turn == 'b' else game.black_king,
        "movedPiece": game.moved_piece,
        "capturedPiece": game.captured_piece
    })   


@app.route("/api/promotion-check", methods=["POST"])
def promotion_check():
    print("entered route handler.")
    data = request.get_json()
    king = tuple(data["king"])
    pieces, _, _ = parse_pieces(data["fen"][:data["fen"].index(' ')])
    in_check = chess.in_check(pieces, king)
    return jsonify({
        "check": in_check,
        "checkmate": False if not in_check else chess.checkmate(pieces, king),
        "stalemate": False if in_check else chess.stalemate(pieces, king)
    })


mapping = {
    "P": chess.Pawn("white"),
    "p": chess.Pawn("black"),
    "R": chess.Rook("white"),
    "r": chess.Rook("black"),
    "B": chess.Bishop("white"),
    "b": chess.Bishop("black"),
    "N": chess.Knight("white"),
    "n": chess.Knight("black"),
    "Q": chess.Queen("white"),
    "q": chess.Queen("black"),
    "K": chess.King("white"),
    "k": chess.King("black"),
}


def parse_FEN(board_fen: str) -> tuple:
    tokens = board_fen.split()
    return (
        tokens[0],
        parse_pieces(tokens[0]),
        tokens[1],
        parse_castling_privileges(tokens[2]),
        parse_enpassant_squares(tokens[3]),
    )


def parse_pieces(piece_placement: str) -> tuple:
    pieces = {}
    for row_index, row in enumerate(piece_placement.split("/")):
        col_index = 0
        for ch in row:
            try:
                col_index += int(ch)
            except ValueError:
                if ch == "K":
                    white_king = row_index, col_index
                elif ch == "k":
                    black_king = row_index, col_index
                pieces[(row_index, col_index)] = mapping[ch]
                col_index += 1
    return pieces, white_king, black_king


def parse_enpassant_squares(squares: str) -> set:
    if squares == "-":
        return set()
    return {
        parse_algebraic_notation(squares[i : i + 2]) for i in range(0, len(squares), 2)
    }


def parse_algebraic_notation(square: str) -> tuple:
    return 8 - int(square[1]), ord(square[0]) - ord('a')


def parse_castling_privileges(privileges: str) -> set:
    if privileges == "-":
        return set()
    return set(privileges)
