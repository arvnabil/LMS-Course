<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificate {{ $certificate->certificate_code }}</title>
    <style>
        @page {
            margin: 0px;
        }
        body {
            margin: 0px;
            padding: 0px;
            font-family: sans-serif;
        }
        .certificate-container {
            position: relative;
            width: 100%;
            height: 100%;
            /* A4 Landscape dimensions roughly */
            min-height: 210mm;
            min-width: 297mm;
        }
        .background-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
        .element {
            position: absolute;
            white-space: nowrap;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <!-- Resolve relative storage path to absolute disk path or base64 data uri for DomPDF -->
        @php
            $bgPath = str_replace('/storage/', '', $template->background_image);
            $fullBgPath = storage_path('app/public/' . $bgPath);
        @endphp
        
        @if(file_exists($fullBgPath))
            <img src="{{ 'data:image/jpeg;base64,' . base64_encode(file_get_contents($fullBgPath)) }}" class="background-image" alt="Background">
        @endif

        @foreach($layout as $key => $props)
            @php
                // Map the layout percentage to actual CSS. 
                // DomPDF supports absolute positioning but transform: translate(-50%, -50%) may have inconsistent support. 
                // So we'll try to rely on top/left offsets. 
                // However, since we stored left/top as percentages, we output them as is.
            @endphp
            
            <div class="element" style="
                left: {{ $props['x'] }}%;
                top: {{ $props['y'] }}%;
                font-size: {{ $props['fontSize'] }}px;
                color: {{ $props['color'] }};
                font-family: {{ $props['fontFamily'] ?? 'sans-serif' }};
                font-weight: {{ $props['fontWeight'] ?? 'normal' }};
                text-align: {{ $props['align'] }}; 
                
                @if($props['align'] === 'center')
                    transform: translateX(-50%) translateY(-50%);
                @elseif($props['align'] === 'right')
                    transform: translateX(-100%) translateY(-50%);
                @else
                    transform: translateY(-50%);
                @endif
            ">
                @if($key === 'student_name')
                    {{ $certificate->student->name }}
                @elseif($key === 'course_title')
                    {{ $certificate->course->title }}
                @elseif($key === 'date')
                    {{ $certificate->issued_at->format('d F Y') }}
                @elseif($key === 'certificate_code')
                    {{ $certificate->certificate_code }}
                @else
                    [{{ strtoupper(str_replace('_', ' ', $key)) }}]
                @endif
            </div>
        @endforeach
    </div>
</body>
</html>
