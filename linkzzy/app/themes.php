<?php
declare(strict_types=1);

/**
 * Profile themes. Each theme is a set of CSS custom properties consumed by
 * public/assets/css/profile.css, so adding a theme is just adding an entry here.
 */
function themes(): array
{
    return [
        'minimal' => [
            'name' => 'Minimal',
            'pro'  => false,
            'vars' => [
                'bg' => '#f7f6f2', 'surface' => '#ffffff', 'text' => '#17161c', 'muted' => '#6b6875',
                'btn-bg' => '#ffffff', 'btn-text' => '#17161c', 'btn-border' => '#e4e1d8',
                'btn-hover' => '#17161c', 'btn-hover-text' => '#ffffff', 'radius' => '14px',
                'font' => '"Inter", system-ui, sans-serif', 'shadow' => '0 1px 2px rgba(23,22,28,.06)',
            ],
        ],
        'midnight' => [
            'name' => 'Midnight',
            'pro'  => false,
            'vars' => [
                'bg' => 'radial-gradient(120% 80% at 50% 0%, #26213f 0%, #0d0c14 60%)', 'surface' => '#16141f',
                'text' => '#f4f2ff', 'muted' => '#a29dbb',
                'btn-bg' => 'rgba(255,255,255,.06)', 'btn-text' => '#f4f2ff', 'btn-border' => 'rgba(255,255,255,.12)',
                'btn-hover' => '#f4f2ff', 'btn-hover-text' => '#0d0c14', 'radius' => '14px',
                'font' => '"Inter", system-ui, sans-serif', 'shadow' => 'none',
            ],
        ],
        'sunset' => [
            'name' => 'Sunset',
            'pro'  => false,
            'vars' => [
                'bg' => 'linear-gradient(160deg, #ffb48a 0%, #ff7a8a 45%, #a35cff 100%)', 'surface' => '#ffffff',
                'text' => '#ffffff', 'muted' => 'rgba(255,255,255,.85)',
                'btn-bg' => 'rgba(255,255,255,.92)', 'btn-text' => '#3a1d3f', 'btn-border' => 'transparent',
                'btn-hover' => '#3a1d3f', 'btn-hover-text' => '#ffffff', 'radius' => '999px',
                'font' => '"Inter", system-ui, sans-serif', 'shadow' => '0 6px 20px rgba(58,29,63,.18)',
            ],
        ],
        'ocean' => [
            'name' => 'Ocean',
            'pro'  => true,
            'vars' => [
                'bg' => 'linear-gradient(180deg, #e6f4f8 0%, #b9e0ec 100%)', 'surface' => '#ffffff',
                'text' => '#0b3442', 'muted' => '#3f6b79',
                'btn-bg' => '#0b3442', 'btn-text' => '#e6f4f8', 'btn-border' => 'transparent',
                'btn-hover' => '#11586e', 'btn-hover-text' => '#ffffff', 'radius' => '10px',
                'font' => '"Inter", system-ui, sans-serif', 'shadow' => '0 4px 14px rgba(11,52,66,.18)',
            ],
        ],
        'forest' => [
            'name' => 'Forest',
            'pro'  => true,
            'vars' => [
                'bg' => '#1f2b22', 'surface' => '#26352a', 'text' => '#eef0e2', 'muted' => '#b3bba2',
                'btn-bg' => 'transparent', 'btn-text' => '#eef0e2', 'btn-border' => '#8a9b6e',
                'btn-hover' => '#d8e3b5', 'btn-hover-text' => '#1f2b22', 'radius' => '4px',
                'font' => '"DM Serif Display", Georgia, serif', 'shadow' => 'none',
            ],
        ],
        'lavender' => [
            'name' => 'Lavender',
            'pro'  => true,
            'vars' => [
                'bg' => 'linear-gradient(180deg, #f3efff 0%, #e4dbff 100%)', 'surface' => '#ffffff',
                'text' => '#2c2156', 'muted' => '#6f6596',
                'btn-bg' => '#ffffff', 'btn-text' => '#2c2156', 'btn-border' => '#d3c8fb',
                'btn-hover' => '#6d4aff', 'btn-hover-text' => '#ffffff', 'radius' => '18px',
                'font' => '"DM Serif Display", Georgia, serif', 'shadow' => '0 2px 0 #d3c8fb',
            ],
        ],
    ];
}

function theme(string $key): array
{
    $themes = themes();
    return $themes[$key] ?? $themes['minimal'];
}

/** The theme a user actually gets: pro themes fall back to Minimal once Pro lapses. */
function effective_theme(array $user): array
{
    $theme = theme($user['theme']);
    return ($theme['pro'] && !is_pro($user)) ? theme('minimal') : $theme;
}

function theme_style(array $theme): string
{
    $out = '';
    foreach ($theme['vars'] as $name => $value) {
        $out .= '--' . $name . ':' . $value . ';';
    }
    return $out;
}
