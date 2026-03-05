// Helper function for doing a "proper" modulo (I.E. including negative values)
export function mod(n, m) {
    return (n % m + m) % m
}
