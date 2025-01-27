function gaussElimination(matrix) {
    for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
            const factor = matrix[j][i] / matrix[i][i];
            for (let k = i; k < 4; k++) {
                matrix[j][k] -= factor * matrix[i][k];
            }
        }
    }

    const c = matrix[2][3] / matrix[2][2];
    const b = (matrix[1][3] - matrix[1][2] * c) / matrix[1][1];
    const a = (matrix[0][3] - matrix[0][2] * c - matrix[0][1] * b) / matrix[0][0];

    return { a, b, c };
}
