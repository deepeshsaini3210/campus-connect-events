package com.university.events.service.mapper;

import com.university.events.api.dto.collaboration.CollaborationDto;
import com.university.events.api.entity.College;
import com.university.events.api.entity.Collaboration;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class CollaborationMapper {

    private static final Pattern COORDINATOR_PATTERN =
            Pattern.compile("^Coordinator:\\s*(.+?)\\s*\\(([^)]+)\\)", Pattern.MULTILINE);

    public CollaborationDto toDto(Collaboration collaboration) {
        if (collaboration == null) {
            return null;
        }

        String notes = collaboration.getNotes();
        String coordinatorName = null;
        String coordinatorEmail = null;
        String userNotes = notes;

        if (notes != null) {
            Matcher matcher = COORDINATOR_PATTERN.matcher(notes);
            if (matcher.find()) {
                coordinatorName = matcher.group(1).trim();
                coordinatorEmail = matcher.group(2).trim();
                userNotes = notes.substring(matcher.end()).trim();
            }
        }

        return CollaborationDto.builder()
                .id(collaboration.getId())
                .requesterCollege(mapCollege(collaboration.getRequesterCollege()))
                .partnerCollege(mapCollege(collaboration.getPartnerCollege()))
                .status(collaboration.getStatus() != null ? collaboration.getStatus().name() : null)
                .coordinatorName(coordinatorName)
                .coordinatorEmail(coordinatorEmail)
                .notes(userNotes != null && !userNotes.isBlank() ? userNotes : notes)
                .specialOffers(collaboration.getSpecialOffers())
                .requestDate(collaboration.getRequestDate())
                .responseDate(collaboration.getResponseDate())
                .updatedAt(collaboration.getUpdatedAt())
                .build();
    }

    private CollaborationDto.CollegeSummaryDto mapCollege(College college) {
        if (college == null) {
            return null;
        }
        return CollaborationDto.CollegeSummaryDto.builder()
                .id(college.getId())
                .name(college.getName())
                .code(college.getCode())
                .build();
    }
}
