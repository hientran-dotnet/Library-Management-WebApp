<?php
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="sach_mau.csv"');
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');

// CSV Template data
$csvData = [
    // Header row
    ['Title', 'Author', 'CategoryID', 'ISBN', 'Quantity', 'PublishYear', 'Description', 'ImagePath'],
    
    // Sample data rows
    [
        'Lập trình PHP căn bản',
        'Nguyễn Văn A',
        '1',
        '978-604-2-12345-0',
        '10',
        '2023',
        'Cuốn sách hướng dẫn lập trình PHP từ cơ bản đến nâng cao',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    ],
    [
        'Truyện Kiều',
        'Nguyễn Du',
        '2',
        '978-604-2-67890-1',
        '15',
        '1815',
        'Tác phẩm văn học kinh điển của Việt Nam',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
    ],
    [
        'Vật lý đại cương',
        'Trần Thị B',
        '3',
        '978-604-2-11111-2',
        '8',
        '2022',
        'Giáo trình vật lý đại cương cho sinh viên',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'
    ],
    [
        'Lịch sử Việt Nam',
        'Lê Văn C',
        '4',
        '978-604-2-22222-3',
        '12',
        '2021',
        'Tổng quan lịch sử Việt Nam qua các thời kỳ',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
    ],
    [
        'Doraemon - Chú mèo máy đến từ tương lai',
        'Fujiko F. Fujio',
        '5',
        '978-604-2-33333-4',
        '20',
        '2020',
        'Truyện tranh thiếu nhi nổi tiếng của Nhật Bản',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
    ]
];

// Output CSV
$output = fopen('php://output', 'w');

// Add BOM for UTF-8
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Write data
foreach ($csvData as $row) {
    fputcsv($output, $row);
}

fclose($output);
exit;
?>
